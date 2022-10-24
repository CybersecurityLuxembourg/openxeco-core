"""empty message

Revision ID: d73f4b8ff77e
Revises: 0d89bd288ce4
Create Date: 2022-10-24 20:41:43.687797

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = 'd73f4b8ff77e'
down_revision = '0d89bd288ce4'
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column('UserProfile', 'domains_of_interest', type_=mysql.TEXT(charset='utf8mb4', collation='utf8mb4_unicode_ci'),  nullable=True)
    op.alter_column('UserProfile', 'industry_id', type_=mysql.INTEGER(), nullable=True)

def downgrade():
    op.alter_column('UserProfile', 'domains_of_interest', type_=mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=110),  nullable=True)
    op.alter_column('UserProfile', 'industry_id', type_=mysql.INTEGER(), nullable=False)