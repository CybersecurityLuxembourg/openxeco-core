"""empty message

Revision ID: 5a831dc9a6f4
Revises: a6f02c599c2f
Create Date: 2022-07-14 12:09:14.511955

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql


# revision identifiers, used by Alembic.
revision = '5a831dc9a6f4'
down_revision = 'a6f02c599c2f'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('CompanyRelationshipType',
    sa.Column('id', mysql.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('name', mysql.VARCHAR(collation='utf8mb4_unicode_ci', length=100), nullable=False),
    sa.Column('is_directional', mysql.TINYINT(display_width=1), server_default=sa.text("'0'"), autoincrement=False, nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('name', name='company_relationship_type_unique_name'),
    mysql_collate='utf8mb4_unicode_ci',
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )

    op.create_table('CompanyRelationship',
    sa.Column('id', mysql.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('company_1', mysql.INTEGER(), nullable=False),
    sa.Column('type', mysql.INTEGER(), nullable=False),
    sa.Column('company_2', mysql.INTEGER(), nullable=False),
    sa.ForeignKeyConstraint(['company_1'], ['Company.id'], name='companyrelationship_ibfk_1', ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['type'], ['CompanyRelationshipType.id'], name='companyrelationship_ibfk_2', onupdate='CASCADE', ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['company_2'], ['Company.id'], name='companyrelationship_ibfk_3', ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    mysql_collate='utf8mb4_unicode_ci',
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )

    op.create_table('Note',
    sa.Column('id', mysql.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('content', mysql.TEXT(charset='utf8mb4', collation='utf8mb4_unicode_ci'), nullable=True),
    sa.Column('admin', mysql.INTEGER(), nullable=True),
    sa.Column('company', mysql.INTEGER(), nullable=True),
    sa.Column('article', mysql.INTEGER(), nullable=True),
    sa.Column('taxonomy_category', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=80), nullable=True),
    sa.Column('user', mysql.INTEGER(), nullable=True),
    sa.Column('sys_date', mysql.TIMESTAMP(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.ForeignKeyConstraint(['admin'], ['User.id'], name='note_admin_ibfk', ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['company'], ['Company.id'], name='note_company_ibfk', ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['article'], ['Article.id'], name='note_article_ibfk', ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['taxonomy_category'], ['TaxonomyCategory.name'], name='note_taxonomy_ibfk', ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['user'], ['User.id'], name='note_user_ibfk', ondelete='CASCADE'),
    mysql_collate='utf8mb4_unicode_ci',
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )

    op.rename_table('Company_Address', 'CompanyAddress')


def downgrade():
    op.drop_table('CompanyRelationship')
    op.drop_table('CompanyRelationshipType')
    op.drop_table('Note')

    op.rename_table('CompanyAddress', 'Company_Address')
