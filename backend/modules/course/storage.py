"""Временные ссылки на видео уроков в S3 (AWS Signature V4, query string).

Видео лежит в приватном бакете Timeweb S3. Зритель получает ссылку, которая
работает S3_VIDEO_LINK_MINUTES минут: переслать её кому-то бесполезно.
Без boto3 — подпись считается стандартной библиотекой.
"""
from __future__ import annotations

import hashlib
import hmac
from datetime import datetime, timezone
from urllib.parse import quote, unquote, urlsplit

from config import settings


def _hmac(key: bytes, msg: str) -> bytes:
    return hmac.new(key, msg.encode(), hashlib.sha256).digest()


def presign_get(url: str, expires_seconds: int, now: datetime | None = None) -> str:
    """Подписать GET-ссылку на объект S3 (path-style: https://host/bucket/key)."""
    parts = urlsplit(url)
    host = parts.netloc
    path = quote(unquote(parts.path), safe="/-_.~")

    now = now or datetime.now(timezone.utc)
    amz_date = now.strftime("%Y%m%dT%H%M%SZ")
    date = now.strftime("%Y%m%d")
    region = settings.s3_region
    scope = f"{date}/{region}/s3/aws4_request"

    params = {
        "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
        "X-Amz-Credential": f"{settings.s3_access_key}/{scope}",
        "X-Amz-Date": amz_date,
        "X-Amz-Expires": str(expires_seconds),
        "X-Amz-SignedHeaders": "host",
    }
    query = "&".join(
        f"{quote(k, safe='-_.~')}={quote(v, safe='-_.~')}" for k, v in sorted(params.items())
    )
    canonical = f"GET\n{path}\n{query}\nhost:{host}\n\nhost\nUNSIGNED-PAYLOAD"
    to_sign = (
        f"AWS4-HMAC-SHA256\n{amz_date}\n{scope}\n"
        f"{hashlib.sha256(canonical.encode()).hexdigest()}"
    )

    key = _hmac(f"AWS4{settings.s3_secret_key}".encode(), date)
    for part in (region, "s3", "aws4_request"):
        key = _hmac(key, part)
    signature = hmac.new(key, to_sign.encode(), hashlib.sha256).hexdigest()

    return f"{parts.scheme}://{host}{path}?{query}&X-Amz-Signature={signature}"


def viewer_video_url(url: str) -> str:
    """Ссылка для плеера: из нашего S3 — временная, остальные — как есть."""
    if not url or not settings.s3_signing_enabled:
        return url
    if urlsplit(url).netloc != urlsplit(settings.s3_endpoint).netloc:
        return url
    return presign_get(url, settings.s3_video_link_minutes * 60)
