"""empty message

Revision ID: 3309703df024
Revises: 08f81a452d53
Create Date: 2022-03-21 12:27:46.123133

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql


# revision identifiers, used by Alembic.
revision = '3309703df024'
down_revision = '08f81a452d53'
branch_labels = None
depends_on = None


def upgrade():
    # Company table

    op.add_column('Company', sa.Column('linkedin_url', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=150), nullable=True))
    op.add_column('Company', sa.Column('twitter_url', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=150), nullable=True))
    op.add_column('Company', sa.Column('youtube_url', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=150), nullable=True))
    op.add_column('Company', sa.Column('discord_url', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=150), nullable=True))

    # TaxonomyCategory table

    op.add_column('TaxonomyCategory', sa.Column('sync_node', mysql.INTEGER(), nullable=True))
    op.add_column('TaxonomyCategory', sa.Column('sync_global', mysql.BOOLEAN()))
    op.add_column('TaxonomyCategory', sa.Column('sync_values', mysql.BOOLEAN()))
    op.add_column('TaxonomyCategory', sa.Column('sync_hierarchy', mysql.BOOLEAN()))
    op.add_column('TaxonomyCategory', sa.Column('sync_status', mysql.ENUM('OK', 'CONFLICT', 'UNFOUND', 'ERROR'),
                                                server_default=sa.text("'OK'"), nullable=False))
    op.create_foreign_key(
        'fk_taxonomycategory_networknode',
        'TaxonomyCategory', 'NetworkNode',
        ['sync_node'], ['id'],
        ondelete="SET NULL",
    )

    # Form table

    op.create_table(
        'Form',
        sa.Column('id', mysql.INTEGER(), autoincrement=True, nullable=False),
        sa.Column('name', mysql.VARCHAR(collation='utf8mb4_unicode_ci', length=200), nullable=False),
        sa.Column('description', mysql.VARCHAR(collation='utf8mb4_unicode_ci', length=500), nullable=True),
        sa.Column('status', mysql.ENUM('ACTIVE', 'INACTIVE', 'DELETED'), server_default=sa.text("'ACTIVE'"), nullable=False),
        sa.Column('keywords', mysql.VARCHAR(collation='utf8mb4_unicode_ci', length=510), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        mysql_collate='utf8mb4_unicode_ci',
        mysql_default_charset='utf8mb4',
        mysql_engine='InnoDB'
    )

    # FormQuestion table

    op.create_table(
        'FormQuestion',
        sa.Column('id', mysql.INTEGER(), autoincrement=True, nullable=False),
        sa.Column('form_id', mysql.INTEGER(), nullable=False),
        sa.Column('position', mysql.INTEGER()),
        sa.Column('type', mysql.ENUM('TEXT', 'CHECKBOX', 'OPTIONS'), nullable=False),
        sa.Column('options', mysql.VARCHAR(collation='utf8mb4_unicode_ci', length=500), nullable=False),
        sa.Column('value', mysql.TEXT(charset='utf8mb4', collation='utf8mb4_unicode_ci')),
        sa.Column('status', mysql.ENUM('ACTIVE', 'INACTIVE', 'DELETED'), server_default=sa.text("'ACTIVE'"), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['form_id'], ['Form.id'], name='form_question_ibfk_1', ondelete='CASCADE'),
        mysql_collate='utf8mb4_unicode_ci',
        mysql_default_charset='utf8mb4',
        mysql_engine='InnoDB'
    )

    # FormAnswer table

    op.create_table(
        'FormAnswer',
        sa.Column('id', mysql.INTEGER(), autoincrement=True, nullable=False),
        sa.Column('form_question_id', mysql.INTEGER(), nullable=False),
        sa.Column('user_id', mysql.INTEGER(), nullable=False),
        sa.Column('value', mysql.TEXT(charset='utf8mb4', collation='utf8mb4_unicode_ci')),
        sa.Column('sys_date', mysql.TIMESTAMP(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['form_question_id'], ['FormQuestion.id'], name='form_answer_ibfk_1', ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['User.id'], name='form_answer_ibfk_2', ondelete='CASCADE'),
        mysql_collate='utf8mb4_unicode_ci',
        mysql_default_charset='utf8mb4',
        mysql_engine='InnoDB'
    )


def downgrade():
    op.drop_column('Company', 'linkedin_url')
    op.drop_column('Company', 'twitter_url')
    op.drop_column('Company', 'youtube_url')
    op.drop_column('Company', 'discord_url')
    op.drop_constraint('fk_taxonomycategory_networknode', 'TaxonomyCategory', 'foreignkey')
    op.drop_column('TaxonomyCategory', 'sync_node')
    op.drop_column('TaxonomyCategory', 'sync_global')
    op.drop_column('TaxonomyCategory', 'sync_values')
    op.drop_column('TaxonomyCategory', 'sync_hierarchy')
    op.drop_column('TaxonomyCategory', 'sync_status')

    '''op.drop_table('Form')
    op.drop_table('FormQuestion')
    op.drop_table('FormAnswer')'''
