"""add landings table

Revision ID: 0011
Revises: 0010
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0011"
down_revision: Union[str, None] = "0010"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create enum type
    landing_status = postgresql.ENUM(
        "draft", "published", name="landing_status", create_type=True
    )
    landing_status.create(op.get_bind())

    op.create_table(
        "landings",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("form_data", sa.JSON(), nullable=False, server_default="{}"),
        sa.Column("sections_json", sa.JSON(), nullable=True),
        sa.Column("html_content", sa.Text(), nullable=True),
        sa.Column("slug", sa.String(100), nullable=False, unique=True),
        sa.Column(
            "status",
            sa.Enum("draft", "published", name="landing_status", create_type=False),
            nullable=False,
            server_default="draft",
        ),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )
    op.create_index("ix_landings_user_id", "landings", ["user_id"])
    op.create_index("ix_landings_slug", "landings", ["slug"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_landings_slug", table_name="landings")
    op.drop_index("ix_landings_user_id", table_name="landings")
    op.drop_table("landings")

    landing_status = postgresql.ENUM(
        "draft", "published", name="landing_status", create_type=False
    )
    landing_status.drop(op.get_bind())
