"""empty message

Revision ID: 0d89bd288ce4
Revises: b18663330e42
Create Date: 2022-10-23 15:03:24.208351

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '0d89bd288ce4'
down_revision = 'b18663330e42'
branch_labels = None
depends_on = None


def upgrade():
    op.drop_column('EntityContact', 'work_email')
    op.drop_column('EntityContact', 'seniority_level')
    op.drop_column('EntityContact', 'work_telephone')

    op.add_column('UserEntityAssignment', sa.Column('work_email', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=110), nullable=True))
    op.add_column('UserEntityAssignment', sa.Column('seniority_level', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=110), nullable=True))
    op.add_column('UserEntityAssignment', sa.Column('work_telephone', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=110), nullable=True))

    op.add_column('User', sa.Column('work_email', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=110), nullable=True)),

def downgrade():
    op.add_column('EntityContact', sa.Column('work_email', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=110), nullable=True))
    op.add_column('EntityContact', sa.Column('seniority_level', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=110), nullable=True))
    op.add_column('EntityContact', sa.Column('work_telephone', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=110), nullable=True))

    op.drop_column('UserEntityAssignment', 'work_email')
    op.drop_column('UserEntityAssignment', 'seniority_level')
    op.drop_column('UserEntityAssignment', 'work_telephone')

    op.drop_column('User', 'work_email')
