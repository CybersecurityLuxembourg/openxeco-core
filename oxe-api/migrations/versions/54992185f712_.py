"""empty message

Revision ID: 54992185f712
Revises: c003c56cd46a
Create Date: 2021-12-09 15:48:43.423427

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '54992185f712'
down_revision = 'c003c56cd46a'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('User', sa.Column('vcard', mysql.TEXT(charset='utf8mb4', collation='utf8mb4_unicode_ci'), nullable=True))
    op.add_column('User', sa.Column('is_vcard_public', mysql.BOOLEAN()))
    op.add_column('User', sa.Column('handle', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=255), nullable=True))
    op.drop_column('User', 'company_on_subscription')
    op.drop_column('User', 'department_on_subscription')


def downgrade():
    op.drop_column('User', 'vcard')
    op.drop_column('User', 'is_vcard_public')
    op.drop_column('User', 'handle')
    op.add_column('User', sa.Column('company_on_subscription', mysql.VARCHAR(collation='utf8mb4_unicode_ci', length=510), nullable=True))
    op.add_column('User', sa.Column('department_on_subscription', mysql.ENUM('TOP MANAGEMENT', 'HUMAN RESOURCE', 'MARKETING',
                                                                             'FINANCE', 'OPERATION/PRODUCTION', 'INFORMATION TECHNOLOGY',
                                                                             'OTHER'), nullable=True))
