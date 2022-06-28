"""empty message

Revision ID: 898407c05fd3
Revises: bb2b89e02547
Create Date: 2022-06-28 09:21:58.817985

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql


# revision identifiers, used by Alembic.
revision = '898407c05fd3'
down_revision = 'bb2b89e02547'
branch_labels = None
depends_on = None


def upgrade():
    op.drop_constraint("workforce_ibfk_2", "Workforce", "foreignkey")
    op.alter_column('Workforce', 'source',
                    type_=mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=80), nullable=True)

    op.drop_table('Source')


def downgrade():
    op.create_table('Source',
    sa.Column('name', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=80),
              nullable=False),
    sa.PrimaryKeyConstraint('name'),
    mysql_collate='utf8mb4_unicode_ci',
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )

    op.create_foreign_key("workforce_ibfk_2", 'Workforce', "Source", ['source'], ['name'])
