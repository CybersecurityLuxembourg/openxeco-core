"""empty message

Revision ID: 7855a5f3f5f1
Revises: 0f2dcdc88768
Create Date: 2023-01-04 12:09:18.547169

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import true, false
from sqlalchemy.dialects import mysql


# revision identifiers, used by Alembic.
revision = '7855a5f3f5f1'
down_revision = '0f2dcdc88768'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'EmailTemplate',
        sa.Column('name', mysql.ENUM('ACCOUNT_CREATION', 'PASSWORD_RESET', 'REQUEST_NOTIFICATION'), nullable=False),
        sa.Column('content', mysql.TEXT(charset='utf8mb4', collation='utf8mb4_unicode_ci'), nullable=True),
        sa.PrimaryKeyConstraint('name'),
        mysql_collate='utf8mb4_unicode_ci',
        mysql_default_charset='utf8mb4',
        mysql_engine='InnoDB'
    )

    op.add_column('User', sa.Column('accept_request_notification', mysql.BOOLEAN(), server_default=true(), nullable=False))
    op.add_column('User', sa.Column('accept_terms_and_conditions', mysql.BOOLEAN(), server_default=false(), nullable=False))
    op.add_column('User', sa.Column('accept_privacy_policy', mysql.BOOLEAN(), server_default=false(), nullable=False))


def downgrade():
    op.drop_table('EmailTemplate')

    op.drop_column('User', 'accept_request_notification')
    op.drop_column('User', 'accept_terms_and_conditions')
    op.drop_column('User', 'accept_privacy_policy')
