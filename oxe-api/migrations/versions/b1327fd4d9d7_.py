"""empty message

Revision ID: b1327fd4d9d7
Revises: 8692e9512214
Create Date: 2022-12-01 06:33:42.361181

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql


# revision identifiers, used by Alembic.
revision = 'b1327fd4d9d7'
down_revision = '8692e9512214'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('UserOtp',
        sa.Column('id', mysql.INTEGER(), autoincrement=True, nullable=False),
        sa.Column('token', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=110), nullable=False),
        sa.Column('timestamp', sa.DATETIME(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),

        sa.Column('user_id', mysql.INTEGER(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['User.id'], name='otp_relationship_upfk_1', ondelete='CASCADE'),

        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', name='otp_relationship_type_unique_user'),
        mysql_collate='utf8mb4_unicode_ci',
        mysql_default_charset='utf8mb4',
        mysql_engine='InnoDB'
    )


def downgrade():
    op.drop_table('UserOtp')
