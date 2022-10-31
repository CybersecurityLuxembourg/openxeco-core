"""empty message

Revision ID: 0e7cf2c7e4b1
Revises: d73f4b8ff77e
Create Date: 2022-10-31 06:25:31.281395

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '0e7cf2c7e4b1'
down_revision = 'd73f4b8ff77e'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('Entity', sa.Column('email', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=110), nullable=True))


def downgrade():
    op.drop_column('Entity', 'email')
