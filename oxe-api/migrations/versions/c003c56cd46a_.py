"""empty message

Revision ID: c003c56cd46a
Revises: 
Create Date: 2021-12-09 12:34:23.457361

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = 'c003c56cd46a'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('User',
    sa.Column('id', mysql.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('email', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=80), nullable=False),
    sa.Column('password', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=255), nullable=False),
    sa.Column('last_name', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=110), nullable=True),
    sa.Column('first_name', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=110), nullable=True),
    sa.Column('telephone', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=55), nullable=True),
    sa.Column('is_admin', mysql.TINYINT(display_width=1), server_default=sa.text("'0'"), autoincrement=False, nullable=True),
    sa.Column('is_active', mysql.TINYINT(display_width=1), server_default=sa.text("'0'"), autoincrement=False, nullable=True),
    sa.Column('sys_date', mysql.TIMESTAMP(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
    sa.Column('accept_communication', mysql.TINYINT(display_width=1), server_default=sa.text("'1'"), autoincrement=False, nullable=True),
    sa.Column('company_on_subscription', mysql.VARCHAR(collation='utf8mb4_unicode_ci', length=510), nullable=True),
    sa.Column('department_on_subscription', mysql.ENUM('TOP MANAGEMENT', 'HUMAN RESOURCE', 'MARKETING', 'FINANCE',
                                                       'OPERATION/PRODUCTION', 'INFORMATION TECHNOLOGY', 'OTHER'), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    mysql_collate='utf8mb4_unicode_ci',
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )
    op.create_index('UC_User_Email', 'User', ['email'], unique=True)
    op.create_table('Company',
    sa.Column('id', mysql.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('trade_register_number', mysql.VARCHAR(collation='utf8mb4_unicode_ci', length=50), nullable=True),
    sa.Column('name', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=255), nullable=False),
    sa.Column('image', mysql.INTEGER(), autoincrement=False, nullable=True),
    sa.Column('description', mysql.TEXT(charset='utf8mb4', collation='utf8mb4_unicode_ci'), nullable=True),
    sa.Column('creation_date', sa.DATE(), nullable=True),
    sa.Column('website', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=255), nullable=True),
    sa.Column('is_startup', mysql.TINYINT(display_width=1), server_default=sa.text("'0'"), autoincrement=False, nullable=False),
    sa.Column('is_cybersecurity_core_business', mysql.TINYINT(display_width=1), server_default=sa.text("'0'"), autoincrement=False, nullable=False),
    sa.Column('status', mysql.ENUM('ACTIVE', 'INACTIVE', 'DELETED'), server_default=sa.text("'ACTIVE'"), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    mysql_collate='utf8mb4_unicode_ci',
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )
    op.create_index('company_status_index', 'Company', ['status'], unique=False)
    op.create_table('Image',
    sa.Column('id', mysql.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('thumbnail', sa.BLOB(), nullable=False),
    sa.Column('width', mysql.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('height', mysql.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('creation_date', sa.DATE(), nullable=False),
    sa.Column('keywords', mysql.VARCHAR(collation='utf8mb4_unicode_ci', length=510), nullable=True),
    sa.Column('is_in_generator', mysql.TINYINT(display_width=1), server_default=sa.text("'0'"), autoincrement=False, nullable=False),
    sa.PrimaryKeyConstraint('id'),
    mysql_collate='utf8mb4_unicode_ci',
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )
    op.create_table('Article',
    sa.Column('id', mysql.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('handle', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=100), nullable=True),
    sa.Column('title', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=255), nullable=False),
    sa.Column('abstract', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=500), nullable=True),
    sa.Column('publication_date', sa.DATE(), server_default=sa.text('(curdate())'), nullable=True),
    sa.Column('start_date', mysql.DATETIME(), nullable=True),
    sa.Column('end_date', mysql.DATETIME(), nullable=True),
    sa.Column('status', mysql.ENUM('DRAFT', 'UNDER REVIEW', 'PUBLIC', 'ARCHIVE'), server_default=sa.text("'DRAFT'"), nullable=False),
    sa.Column('type', mysql.ENUM('NEWS', 'EVENT', 'TOOL', 'SERVICE', 'RESOURCE', 'JOB OFFER'), server_default=sa.text("'NEWS'"), nullable=True),
    sa.Column('image', mysql.INTEGER(), autoincrement=False, nullable=True),
    sa.Column('external_reference', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=50), nullable=True),
    sa.Column('link', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=550), nullable=True),
    sa.Column('is_created_by_admin', mysql.TINYINT(display_width=1), server_default=sa.text("'0'"), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['image'], ['Image.id'], name='Article_ibfk_1', onupdate='CASCADE', ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    mysql_collate='utf8mb4_unicode_ci',
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )
    op.create_index('handle', 'Article', ['handle'], unique=False)
    op.create_index('article_type_index', 'Article', ['type'], unique=False)
    op.create_index('article_status_index', 'Article', ['status'], unique=False)
    op.create_table('ArticleVersion',
    sa.Column('id', mysql.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('name', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=100), nullable=False),
    sa.Column('is_main', mysql.TINYINT(display_width=1), server_default=sa.text("'0'"), autoincrement=False, nullable=False),
    sa.Column('article_id', mysql.INTEGER(), autoincrement=False, nullable=False),
    sa.ForeignKeyConstraint(['article_id'], ['Article.id'], name='ArticleVersion_ibfk_1', onupdate='CASCADE', ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    mysql_collate='utf8mb4_unicode_ci',
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )
    op.create_table('ArticleBox',
    sa.Column('id', mysql.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('position', mysql.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('type', mysql.ENUM('PARAGRAPH', 'TITLE1', 'TITLE2', 'TITLE3', 'IMAGE', 'FRAME'), nullable=False),
    sa.Column('content', mysql.TEXT(charset='utf8mb4', collation='utf8mb4_unicode_ci'), nullable=True),
    sa.Column('article_version_id', mysql.INTEGER(), autoincrement=False, nullable=False),
    sa.ForeignKeyConstraint(['article_version_id'], ['ArticleVersion.id'], name='ArticleBox_ibfk_1', onupdate='CASCADE', ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    mysql_collate='utf8mb4_unicode_ci',
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )
    op.create_table('Source',
    sa.Column('name', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=80), nullable=False),
    sa.PrimaryKeyConstraint('name'),
    mysql_collate='utf8mb4_unicode_ci',
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )
    op.create_table('Workforce',
    sa.Column('id', mysql.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('company', mysql.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('workforce', mysql.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('date', sa.DATE(), nullable=False),
    sa.Column('is_estimated', mysql.TINYINT(display_width=1), server_default=sa.text("'0'"), autoincrement=False, nullable=False),
    sa.Column('source', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=80), nullable=False),
    sa.ForeignKeyConstraint(['company'], ['Company.id'], name='workforce_ibfk_1', ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['source'], ['Source.name'], name='workforce_ibfk_2', onupdate='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    mysql_collate='utf8mb4_unicode_ci',
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )
    op.create_table('UserCompanyAssignment',
    sa.Column('user_id', mysql.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('company_id', mysql.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('department', mysql.ENUM('TOP MANAGEMENT', 'HUMAN RESOURCE', 'MARKETING', 'FINANCE', 'OPERATION/PRODUCTION',
                                       'INFORMATION TECHNOLOGY', 'OTHER'), nullable=True),
    sa.ForeignKeyConstraint(['company_id'], ['Company.id'], name='UserCompanyAssignment_ibfk_2', onupdate='CASCADE', ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['user_id'], ['User.id'], name='UserCompanyAssignment_ibfk_1', onupdate='CASCADE', ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('user_id', 'company_id'),
    mysql_collate='utf8mb4_unicode_ci',
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )
    op.create_table('TaxonomyCategory',
    sa.Column('name', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=80), nullable=False),
    sa.Column('active_on_companies', mysql.TINYINT(display_width=1), server_default=sa.text("'0'"), autoincrement=False, nullable=True),
    sa.Column('active_on_articles', mysql.TINYINT(display_width=1), server_default=sa.text("'0'"), autoincrement=False, nullable=True),
    sa.Column('accepted_article_types', mysql.VARCHAR(collation='utf8mb4_unicode_ci', length=255), nullable=True),
    sa.Column('is_standard', mysql.TINYINT(display_width=1), server_default=sa.text("'0'"), autoincrement=False, nullable=True),
    sa.PrimaryKeyConstraint('name'),
    mysql_collate='utf8mb4_unicode_ci',
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )
    op.create_table('TaxonomyValue',
    sa.Column('id', mysql.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('name', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=80), nullable=False),
    sa.Column('category', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=80), nullable=False),
    sa.ForeignKeyConstraint(['category'], ['TaxonomyCategory.name'], name='taxonomyvalue_ibfk_1', onupdate='CASCADE', ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('name', 'category', name='taxonomy_value_name_category_unique'),
    mysql_collate='utf8mb4_unicode_ci',
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )
    op.create_table('ArticleTaxonomyTag',
    sa.Column('article', mysql.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('taxonomy_value', mysql.INTEGER(), autoincrement=False, nullable=False),
    sa.ForeignKeyConstraint(['article'], ['Article.id'], name='ArticleTaxonomyTag_ibfk_1', onupdate='CASCADE', ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['taxonomy_value'], ['TaxonomyValue.id'], name='ArticleTaxonomyTag_ibfk_2', onupdate='CASCADE', ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('article', 'taxonomy_value'),
    mysql_collate='utf8mb4_unicode_ci',
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )
    op.create_table('DataControl',
    sa.Column('id', mysql.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('category', mysql.VARCHAR(collation='utf8mb4_unicode_ci', length=255), nullable=True),
    sa.Column('value', mysql.VARCHAR(collation='utf8mb4_unicode_ci', length=255), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    mysql_collate='utf8mb4_unicode_ci',
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )
    op.create_table('Communication',
    sa.Column('id', mysql.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('addresses', mysql.TEXT(collation='utf8mb4_unicode_ci'), nullable=True),
    sa.Column('subject', mysql.VARCHAR(collation='utf8mb4_unicode_ci', length=255), nullable=False),
    sa.Column('body', mysql.TEXT(collation='utf8mb4_unicode_ci'), nullable=False),
    sa.Column('status', mysql.ENUM('DRAFT', 'PROCESSED'), server_default=sa.text("'DRAFT'"), nullable=False),
    sa.Column('sys_date', mysql.TIMESTAMP(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    mysql_collate='utf8mb4_unicode_ci',
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )
    op.create_table('Company_Address',
    sa.Column('id', mysql.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('company_id', mysql.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('number', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=15), nullable=True),
    sa.Column('address_1', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=100), nullable=False),
    sa.Column('address_2', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=100), nullable=True),
    sa.Column('postal_code', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=10), nullable=True),
    sa.Column('city', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=80), nullable=False),
    sa.Column('administrative_area', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=80), nullable=True),
    sa.Column('country', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=50), nullable=False),
    sa.Column('latitude', mysql.DOUBLE(asdecimal=True), nullable=True),
    sa.Column('longitude', mysql.DOUBLE(asdecimal=True), nullable=True),
    sa.ForeignKeyConstraint(['company_id'], ['Company.id'], name='company_address_ibfk_1', ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    mysql_collate='utf8mb4_unicode_ci',
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )
    op.create_table('UserGroup',
    sa.Column('id', mysql.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('name', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=255), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    mysql_collate='utf8mb4_unicode_ci',
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )
    op.create_table('UserGroupRight',
    sa.Column('group_id', mysql.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('resource', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=255), nullable=False),
    sa.Column('parameter', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=255), nullable=True),
    sa.ForeignKeyConstraint(['group_id'], ['UserGroup.id'], name='UserGroupRight_ibfk_1', onupdate='CASCADE', ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('group_id', 'resource'),
    mysql_collate='utf8mb4_unicode_ci',
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )
    op.create_table('NetworkNode',
    sa.Column('id', mysql.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('api_endpoint', mysql.VARCHAR(collation='utf8mb4_unicode_ci', length=255), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    mysql_collate='utf8mb4_unicode_ci',
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )
    op.create_table('TaxonomyAssignment',
    sa.Column('company', mysql.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('taxonomy_value', mysql.INTEGER(), autoincrement=False, nullable=False),
    sa.ForeignKeyConstraint(['company'], ['Company.id'], name='taxonomyassignment_ibfk_1', ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['taxonomy_value'], ['TaxonomyValue.id'], name='taxonomyassignment_ibfk_2', onupdate='CASCADE', ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('company', 'taxonomy_value'),
    mysql_collate='utf8mb4_unicode_ci',
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )
    op.create_table('UserGroupAssignment',
    sa.Column('group_id', mysql.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('user_id', mysql.INTEGER(), autoincrement=False, nullable=False),
    sa.ForeignKeyConstraint(['group_id'], ['UserGroup.id'], name='UserGroupAssignment_ibfk_1', onupdate='CASCADE', ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['user_id'], ['User.id'], name='UserGroupAssignment_ibfk_2', onupdate='CASCADE', ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('group_id', 'user_id'),
    mysql_collate='utf8mb4_unicode_ci',
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )
    op.create_table('UserRequest',
    sa.Column('id', mysql.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('user_id', mysql.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('company_id', mysql.INTEGER(), autoincrement=False, nullable=True),
    sa.Column('status', mysql.ENUM('NEW', 'IN PROCESS', 'PROCESSED', 'REJECTED'), server_default=sa.text("'NEW'"), nullable=False),
    sa.Column('request', mysql.TEXT(charset='utf8mb4', collation='utf8mb4_unicode_ci'), nullable=False),
    sa.Column('data', mysql.JSON(), nullable=True),
    sa.Column('image', mysql.LONGBLOB(), nullable=True),
    sa.Column('submission_date', mysql.TIMESTAMP(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
    sa.Column('type', mysql.ENUM('ENTITY ADD', 'ENTITY CHANGE', 'ENTITY ACCESS CLAIM', 'ENTITY ADDRESS CHANGE', 'ENTITY ADDRESS ADD',
                                 'ENTITY ADDRESS DELETION', 'ENTITY TAXONOMY CHANGE', 'ENTITY LOGO CHANGE'), nullable=True),
    sa.ForeignKeyConstraint(['company_id'], ['Company.id'], name='userrequest_ibfk_2', onupdate='CASCADE', ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['user_id'], ['User.id'], name='UserRequest_ibfk_1', onupdate='CASCADE', ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    mysql_collate='utf8mb4_unicode_ci',
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )
    op.create_table('Log',
    sa.Column('id', mysql.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('user_id', mysql.INTEGER(), autoincrement=False, nullable=True),
    sa.Column('request', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=150), nullable=False),
    sa.Column('request_method', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=10), nullable=False),
    sa.Column('params', mysql.TEXT(charset='utf8mb4', collation='utf8mb4_unicode_ci'), nullable=True),
    sa.Column('status_code', mysql.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('status_description', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=150), nullable=True),
    sa.Column('sys_date', mysql.TIMESTAMP(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    mysql_collate='utf8mb4_unicode_ci',
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )
    op.create_table('CompanyContact',
    sa.Column('id', mysql.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('company_id', mysql.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('type', mysql.ENUM('EMAIL ADDRESS', 'PHONE NUMBER'), nullable=False),
    sa.Column('representative', mysql.ENUM('ENTITY', 'PHYSICAL PERSON'), nullable=False),
    sa.Column('name', mysql.VARCHAR(collation='utf8mb4_unicode_ci', length=255), nullable=True),
    sa.Column('value', mysql.VARCHAR(collation='utf8mb4_unicode_ci', length=255), nullable=False),
    sa.ForeignKeyConstraint(['company_id'], ['Company.id'], name='companycontact_ibfk_1', ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    mysql_collate='utf8mb4_unicode_ci',
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )
    op.create_table('ArticleCompanyTag',
    sa.Column('article', mysql.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('company', mysql.INTEGER(), autoincrement=False, nullable=False),
    sa.ForeignKeyConstraint(['article'], ['Article.id'], name='ArticleCompanyTag_ibfk_1', onupdate='CASCADE', ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['company'], ['Company.id'], name='ArticleCompanyTag_ibfk_2', onupdate='CASCADE', ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('article', 'company'),
    mysql_collate='utf8mb4_unicode_ci',
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )
    op.create_table('RssFeed',
    sa.Column('url', mysql.VARCHAR(collation='utf8mb4_unicode_ci', length=255), nullable=False),
    sa.PrimaryKeyConstraint('url'),
    mysql_collate='utf8mb4_unicode_ci',
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )
    op.create_index('unique_taxonomy_value_name_category', 'TaxonomyValue', ['name', 'category'], unique=False)
    op.create_index('taxonomy_value_name_index', 'TaxonomyValue', ['name'], unique=False)
    op.create_table('TaxonomyCategoryHierarchy',
    sa.Column('parent_category', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=80), nullable=False),
    sa.Column('child_category', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=80), nullable=False),
    sa.ForeignKeyConstraint(['child_category'], ['TaxonomyCategory.name'], name='taxonomycategoryhierarchy_ibfk_2', onupdate='CASCADE', ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['parent_category'], ['TaxonomyCategory.name'], name='taxonomycategoryhierarchy_ibfk_1', onupdate='CASCADE', ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('parent_category', 'child_category'),
    mysql_collate='utf8mb4_unicode_ci',
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )
    op.create_table('Setting',
    sa.Column('property', mysql.VARCHAR(collation='utf8mb4_unicode_ci', length=255), nullable=False),
    sa.Column('value', mysql.TEXT(collation='utf8mb4_unicode_ci'), nullable=False),
    sa.PrimaryKeyConstraint('property'),
    mysql_collate='utf8mb4_unicode_ci',
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )
    op.create_table('TaxonomyValueHierarchy',
    sa.Column('parent_value', mysql.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('child_value', mysql.INTEGER(), autoincrement=False, nullable=False),
    sa.ForeignKeyConstraint(['child_value'], ['TaxonomyValue.id'], name='taxonomyvaluehierarchy_ibfk_2', onupdate='CASCADE', ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['parent_value'], ['TaxonomyValue.id'], name='taxonomyvaluehierarchy_ibfk_1', onupdate='CASCADE', ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('parent_value', 'child_value'),
    mysql_collate='utf8mb4_unicode_ci',
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )


def downgrade():
    op.drop_table('TaxonomyAssignment')
    op.drop_table('ArticleTaxonomyTag')
    op.drop_table('TaxonomyCategoryHierarchy')
    op.drop_table('TaxonomyValueHierarchy')
    op.drop_table('TaxonomyValue')
    op.drop_table('TaxonomyCategory')
    op.drop_table('Setting')
    op.drop_table('RssFeed')
    op.drop_table('ArticleCompanyTag')
    op.drop_table('CompanyContact')
    op.drop_table('Log')
    op.drop_table('UserRequest')
    op.drop_table('UserGroupAssignment')
    op.drop_table('ArticleBox')
    op.drop_table('ArticleVersion')
    op.drop_table('Article')
    op.drop_table('NetworkNode')
    op.drop_table('UserGroupRight')
    op.drop_table('UserCompanyAssignment')
    op.drop_table('UserGroup')
    op.drop_table('User')
    op.drop_table('Image')
    op.drop_table('Workforce')
    op.drop_table('Company_Address')
    op.drop_table('Company')
    op.drop_table('Communication')
    op.drop_table('Source')
    op.drop_table('DataControl')
