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
    op.add_column('Company', sa.Column('headline', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=50), nullable=True))

    op.rename_table('Company', 'Entity')
    op.rename_table('CompanyAddress', 'EntityAddress')
    op.rename_table('CompanyContact', 'EntityContact')
    op.rename_table('CompanyRelationship', 'EntityRelationship')
    op.rename_table('CompanyRelationshipType', 'EntityRelationshipType')
    op.rename_table('ArticleCompanyTag', 'ArticleEntityTag')
    op.rename_table('UserCompanyAssignment', 'UserEntityAssignment')

    op.alter_column('ArticleEntityTag', 'company', new_column_name='entity_id', existing_type=mysql.INTEGER())
    op.alter_column('ArticleEntityTag', 'article', new_column_name='article_id', existing_type=mysql.INTEGER())
    op.alter_column('ArticleTaxonomyTag', 'taxonomy_value', new_column_name='taxonomy_value_id', existing_type=mysql.INTEGER())
    op.alter_column('ArticleTaxonomyTag', 'article', new_column_name='article_id', existing_type=mysql.INTEGER())
    op.alter_column('EntityAddress', 'company_id', new_column_name='entity_id', existing_type=mysql.INTEGER())
    op.alter_column('EntityContact', 'company_id', new_column_name='entity_id', existing_type=mysql.INTEGER())
    op.alter_column('EntityRelationship', 'company_1', new_column_name='entity_id_1', existing_type=mysql.INTEGER())
    op.alter_column('EntityRelationship', 'company_2', new_column_name='entity_id_2', existing_type=mysql.INTEGER())
    op.alter_column('Note', 'company', new_column_name='entity_id', existing_type=mysql.INTEGER())
    op.alter_column('RssFeed', 'company_id', new_column_name='entity_id', existing_type=mysql.INTEGER())
    op.alter_column('TaxonomyCategory', 'active_on_companies', new_column_name='active_on_entities',
                    existing_type=mysql.TINYINT(display_width=1), existing_server_default=sa.text("'0'"),
                    existing_nullable=False)
    op.alter_column('TaxonomyAssignment', 'company', new_column_name='entity_id', existing_type=mysql.INTEGER())
    op.alter_column('TaxonomyAssignment', 'taxonomy_value', new_column_name='taxonomy_value_id', existing_type=mysql.INTEGER())
    op.alter_column('UserEntityAssignment', 'company_id', new_column_name='entity_id', existing_type=mysql.INTEGER())
    op.alter_column('UserRequest', 'company_id', new_column_name='entity_id', existing_type=mysql.INTEGER())
    op.alter_column('Workforce', 'company', new_column_name='entity_id', existing_type=mysql.INTEGER())


def downgrade():
    op.alter_column('FormQuestion', 'type', type_=mysql.ENUM('TEXT', 'CHECKBOX', 'OPTIONS'), server_default=sa.text("'TEXT'"), nullable=False)
    op.alter_column('Form', 'description', type_=mysql.VARCHAR(collation='utf8mb4_unicode_ci', length=500), nullable=True)
    op.drop_column('Entity', 'headline')

    op.alter_column('ArticleEntityTag', 'entity_id', new_column_name='company', existing_type=mysql.INTEGER())
    op.alter_column('ArticleEntityTag', 'article_id', new_column_name='article', existing_type=mysql.INTEGER())
    op.alter_column('ArticleTaxonomyTag', 'taxonomy_value_id', new_column_name='taxonomy_value', existing_type=mysql.INTEGER())
    op.alter_column('ArticleTaxonomyTag', 'article_id', new_column_name='article', existing_type=mysql.INTEGER())
    op.alter_column('EntityAddress', 'entity_id', new_column_name='company_id', existing_type=mysql.INTEGER())
    op.alter_column('EntityContact', 'entity_id', new_column_name='company_id', existing_type=mysql.INTEGER())
    op.alter_column('EntityRelationship', 'entity_id_1', new_column_name='company_1', existing_type=mysql.INTEGER())
    op.alter_column('EntityRelationship', 'entity_id_2', new_column_name='company_2', existing_type=mysql.INTEGER())
    op.alter_column('Note', 'entity_id', new_column_name='company', existing_type=mysql.INTEGER())
    op.alter_column('RssFeed', 'entity_id', new_column_name='company_id', existing_type=mysql.INTEGER())
    op.alter_column('TaxonomyCategory', 'active_on_entities', new_column_name='active_on_companies',
                    existing_type=mysql.TINYINT(display_width=1), existing_server_default=sa.text("'0'"),
                    existing_nullable=False)
    op.alter_column('TaxonomyAssignment', 'entity_id', new_column_name='company', existing_type=mysql.INTEGER())
    op.alter_column('TaxonomyAssignment', 'taxonomy_value_id', new_column_name='taxonomy_value', existing_type=mysql.INTEGER())
    op.alter_column('UserEntityAssignment', 'entity_id', new_column_name='company_id', existing_type=mysql.INTEGER())
    op.alter_column('UserRequest', 'entity_id', new_column_name='company_id', existing_type=mysql.INTEGER())
    op.alter_column('Workforce', 'entity_id', new_column_name='company', existing_type=mysql.INTEGER())

    op.rename_table('Entity', 'Company')
    op.rename_table('EntityAddress', 'CompanyAddress')
    op.rename_table('EntityContact', 'CompanyContact')
    op.rename_table('EntityRelationship', 'CompanyRelationship')
    op.rename_table('EntityRelationshipType', 'CompanyRelationshipType')
    op.rename_table('ArticleEntityTag', 'ArticleCompanyTag')
    op.rename_table('UserEntityAssignment', 'UserCompanyAssignment')
