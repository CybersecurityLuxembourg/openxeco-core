"""empty message

Revision ID: cbc009e647f8
Revises: ffe1fcdacc7d
Create Date: 2022-09-06 14:42:43.248863

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql


# revision identifiers, used by Alembic.
revision = 'cbc009e647f8'
down_revision = 'ffe1fcdacc7d'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('Form', sa.Column('reference', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=20), nullable=True))
    op.add_column('FormQuestion', sa.Column('reference', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=20), nullable=True))


def downgrade():
    op.drop_column('Form', 'reference')
    op.drop_column('FormQuestion', 'reference')
