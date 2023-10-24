"""empty message

Revision ID: 3a4cde367901
Revises: a6867b1327d2
Create Date: 2023-10-24 11:23:30.755612

"""
from alembic import op
from sqlalchemy.dialects import mysql


# revision identifiers, used by Alembic.
revision = '3a4cde367901'
down_revision = 'a6867b1327d2'
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column('FormQuestion', 'reference',
                    type_=mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=30), nullable=True)
    op.alter_column('FormQuestion', 'options',
                    type_=mysql.TEXT(charset='utf8mb4', collation='utf8mb4_unicode_ci'), nullable=True)


def downgrade():
    op.alter_column('FormQuestion', 'reference',
                    type_=mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=20), nullable=True)
    op.alter_column('FormQuestion', 'options',
                    type_=mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=500), nullable=True)
