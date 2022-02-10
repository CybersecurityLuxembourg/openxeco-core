"""empty message

Revision ID: 08f81a452d53
Revises: 54992185f712
Create Date: 2022-01-11 14:55:45.949462

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '08f81a452d53'
down_revision = '54992185f712'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('Document',
    sa.Column('id', mysql.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('filename', mysql.VARCHAR(collation='utf8mb4_unicode_ci', length=200), nullable=False),
    sa.Column('size', mysql.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('creation_date', sa.DATE(), nullable=False),
    sa.Column('keywords', mysql.VARCHAR(collation='utf8mb4_unicode_ci', length=510), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    mysql_collate='utf8mb4_unicode_ci',
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )
    op.create_index('UC_Document_Filename', 'Document', ['filename'], unique=True)
    op.add_column('RssFeed', sa.Column('company_id', mysql.INTEGER(), nullable=True))
    op.create_foreign_key(
        'fk_company_rssfeed',
        'RssFeed', 'Company',
        ['company_id'], ['id'],
    )
    op.add_column('CompanyContact',
                  sa.Column('department', mysql.ENUM('TOP MANAGEMENT', 'HUMAN RESOURCE', 'MARKETING',
                                                     'FINANCE', 'OPERATION/PRODUCTION',
                                                     'INFORMATION TECHNOLOGY',
                                                     'OTHER'), nullable=True))


def downgrade():
    op.drop_table('Document')
    op.drop_constraint('fk_company_rssfeed', 'RssFeed', 'foreignkey')
    op.drop_column('RssFeed', 'company_id')
    op.drop_column('CompanyContact', 'department')
