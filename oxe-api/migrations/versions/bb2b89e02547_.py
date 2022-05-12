"""empty message

Revision ID: bb2b89e02547
Revises: 3309703df024
Create Date: 2022-05-12 14:10:01.139314

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'bb2b89e02547'
down_revision = '3309703df024'
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column('Article', 'publication_date',
                    type_=sa.DATETIME(), server_default=sa.sql.func.now(), nullable=True)


def downgrade():
    op.alter_column('Article', 'publication_date',
                    type_=sa.DATE(), server_default=sa.text('(curdate())'), nullable=True)
