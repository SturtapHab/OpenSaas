"""course orders (покупка курса без регистрации)

Revision ID: 0011
Revises: 0010
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0011"
down_revision: Union[str, None] = "0010"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "course_orders",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("inv_id", sa.String(32), nullable=False),
        sa.Column("amount", sa.Numeric(10, 2), nullable=False),
        sa.Column(
            "status",
            sa.Enum("pending", "paid", name="course_order_status"),
            nullable=False,
        ),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column("paid_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_course_orders_inv_id", "course_orders", ["inv_id"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_course_orders_inv_id", table_name="course_orders")
    op.drop_table("course_orders")
    sa.Enum(name="course_order_status").drop(op.get_bind(), checkfirst=True)
