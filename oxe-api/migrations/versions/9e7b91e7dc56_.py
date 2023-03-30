"""empty message

Revision ID: 9e7b91e7dc56
Revises: 67bbc1731e7a
Create Date: 2023-03-29 10:48:10.855384

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql


# revision identifiers, used by Alembic.
revision = '9e7b91e7dc56'
down_revision = '67bbc1731e7a'
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column('ArticleBox', 'type', type_=mysql.ENUM('PARAGRAPH', 'TITLE1', 'TITLE2', 'TITLE3', 'IMAGE', 'FRAME', 'MERMAID'), server_default=sa.text("'PARAGRAPH'"), nullable=False)


def downgrade():
    op.alter_column('ArticleBox', 'type', type_=mysql.ENUM('PARAGRAPH', 'TITLE1', 'TITLE2', 'TITLE3', 'IMAGE', 'FRAME'), server_default=sa.text("'PARAGRAPH'"), nullable=False)
