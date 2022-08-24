"""empty message

Revision ID: ffe1fcdacc7d
Revises: 5a831dc9a6f4
Create Date: 2022-08-24 13:54:48.757377

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql


# revision identifiers, used by Alembic.
revision = 'ffe1fcdacc7d'
down_revision = '5a831dc9a6f4'
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column('FormQuestion', 'type', type_=mysql.ENUM('TEXT', 'CHECKBOX', 'OPTIONS', 'SELECT'), server_default=sa.text("'TEXT'"), nullable=False)
    op.alter_column('Form', 'description', type_=mysql.TEXT(charset='utf8mb4', collation='utf8mb4_unicode_ci'),  nullable=True)


def downgrade():
    op.alter_column('FormQuestion', 'type', type_=mysql.ENUM('TEXT', 'CHECKBOX', 'OPTIONS'), server_default=sa.text("'TEXT'"), nullable=False)
    op.alter_column('Form', 'description', type_=mysql.VARCHAR(collation='utf8mb4_unicode_ci', length=500), nullable=True)
