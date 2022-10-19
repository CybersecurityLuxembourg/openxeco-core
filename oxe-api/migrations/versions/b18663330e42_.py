"""empty message

Revision ID: b18663330e42
Revises: 46225c53aaf6
Create Date: 2022-10-19 20:43:38.737169

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql


# revision identifiers, used by Alembic.
revision = 'b18663330e42'
down_revision = '46225c53aaf6'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('AuditRecord',
        sa.Column('id', mysql.INTEGER(), autoincrement=True, nullable=False),
        sa.Column('timestamp', sa.DATE(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('entity_type', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=110), nullable=False),
        sa.Column('entity_id', mysql.INTEGER(), nullable=False),
        sa.Column('action', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=110), nullable=False),
        sa.Column('values_before', mysql.TEXT(charset='utf8mb4', collation='utf8mb4_unicode_ci'), nullable=False),
        sa.Column('values_after', mysql.TEXT(charset='utf8mb4', collation='utf8mb4_unicode_ci',), nullable=False),

        sa.Column('user_id', mysql.INTEGER(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['User.id'], name='audit_relationship_upfk_1', ondelete='CASCADE'),

        sa.PrimaryKeyConstraint('id'),
        mysql_collate='utf8mb4_unicode_ci',
        mysql_default_charset='utf8mb4',
        mysql_engine='InnoDB'
    )


def downgrade():
    op.drop_table('AuditRecord')
