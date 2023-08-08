"""empty message

Revision ID: a6867b1327d2
Revises: 67bbc1731e7a
Create Date: 2023-08-08 09:25:55.107312

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql


# revision identifiers, used by Alembic.
revision = 'a6867b1327d2'
down_revision = '67bbc1731e7a'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('FormAnswer',
                  sa.Column('last_date', mysql.TIMESTAMP(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True))


def downgrade():
    op.drop_column('FormAnswer', 'last_date')
