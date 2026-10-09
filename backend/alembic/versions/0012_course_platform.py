"""course on platform: доступ у пользователя, уроки, email заказа до оплаты

Revision ID: 0012
Revises: 0011
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0012"
down_revision: Union[str, None] = "0011"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "users", sa.Column("course_access_at", sa.DateTime(timezone=True), nullable=True)
    )
    op.add_column(
        "course_orders",
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
    )
    op.create_table(
        "course_lessons",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("position", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False, server_default=""),
        sa.Column("video_url", sa.String(1000), nullable=False, server_default=""),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
    )

    # Кто уже купил курс (раньше уроки были в Telegram) и зарегистрирован с той же
    # почтой — сразу получает доступ на платформе. Остальным доступ выдаётся из админки.
    op.execute(
        """
        UPDATE users u
        SET course_access_at = o.paid_at
        FROM (
            SELECT lower(email) AS email, coalesce(min(paid_at), now()) AS paid_at
            FROM course_orders
            WHERE status = 'paid' AND email IS NOT NULL
            GROUP BY lower(email)
        ) o
        WHERE lower(u.email) = o.email AND u.course_access_at IS NULL
        """
    )


def downgrade() -> None:
    op.drop_table("course_lessons")
    op.drop_column("course_orders", "user_id")
    op.drop_column("users", "course_access_at")
