"""empty message

Revision ID: 69de1c1153df
Revises: ffe1fcdacc7d
Create Date: 2022-09-19 17:42:15.959499

"""
from alembic import op
from sqlalchemy.dialects import mysql


# revision identifiers, used by Alembic.
revision = '69de1c1153df'
down_revision = 'ffe1fcdacc7d'
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column('Entity', 'headline', type_=mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=100), nullable=True)


def downgrade():
    op.alter_column('Entity', 'headline', type_=mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=50), nullable=True)
