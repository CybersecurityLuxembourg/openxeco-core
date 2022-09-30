"""empty message

Revision ID: f8a016bff579
Revises: ffe1fcdacc7d
Create Date: 2022-09-21 19:11:49.604203

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = 'f8a016bff579'
down_revision = 'ffe1fcdacc7d'
branch_labels = None
depends_on = None

SECTOR_OPTIONS = ["private", "public"]

def upgrade():

    op.create_table('Country',
        sa.Column('id', mysql.INTEGER(), autoincrement=True, nullable=False),
        sa.Column('name', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=110), nullable=True),

        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name', name='country_relationship_type_unique_name'),
        mysql_collate='utf8mb4_unicode_ci',
        mysql_default_charset='utf8mb4',
        mysql_engine='InnoDB'
    )

    op.create_table('Profession',
        sa.Column('id', mysql.INTEGER(), autoincrement=True, nullable=False),
        sa.Column('name', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=110), nullable=True),
        sa.Column('description', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=255), nullable=True),

        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name', name='profession_relationship_type_unique_name'),
        mysql_collate='utf8mb4_unicode_ci',
        mysql_default_charset='utf8mb4',
        mysql_engine='InnoDB'
    )


    op.create_table('Expertise',
        sa.Column('id', mysql.INTEGER(), autoincrement=True, nullable=False),
        sa.Column('name', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=110), nullable=True),
        sa.Column('description', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=255), nullable=True),

        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name', name='expertise_relationship_type_unique_name'),
        mysql_collate='utf8mb4_unicode_ci',
        mysql_default_charset='utf8mb4',
        mysql_engine='InnoDB'
    )

    op.create_table('Industry',
        sa.Column('id', mysql.INTEGER(), autoincrement=True, nullable=False),
        sa.Column('name', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=110), nullable=True),

        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name', name='industry_relationship_type_unique_name'),
        mysql_collate='utf8mb4_unicode_ci',
        mysql_default_charset='utf8mb4',
        mysql_engine='InnoDB'
    )

    op.create_table('Domain',
        sa.Column('id', mysql.INTEGER(), autoincrement=True, nullable=False),
        sa.Column('name', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=110), nullable=True),

        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name', name='domain_relationship_type_unique_name'),
        mysql_collate='utf8mb4_unicode_ci',
        mysql_default_charset='utf8mb4',
        mysql_engine='InnoDB'
    )

    op.create_table('UserProfile',
        sa.Column('id', mysql.INTEGER(), autoincrement=True, nullable=False),
        sa.Column('gender', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=110), nullable=True),
        sa.Column('sector', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=110), nullable=True),
        sa.Column('residency', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=110), nullable=True),
        sa.Column('mobile', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=110), nullable=True),
        sa.Column('experience', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=110), nullable=True),
        sa.Column('domains_of_interest', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=110), nullable=True),
        sa.Column('how_heard', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=110), nullable=True),
        sa.Column('affiliated', mysql.TINYINT(), nullable=True),

        sa.Column('user_id', mysql.INTEGER(), nullable=False),
        sa.Column('profession_id', mysql.INTEGER(), nullable=False),
        sa.Column('industry_id', mysql.INTEGER(), nullable=False),
        sa.Column('nationality_id', mysql.INTEGER(), nullable=False),
        sa.Column('expertise_id', mysql.INTEGER(), nullable=False),

        sa.ForeignKeyConstraint(['user_id'], ['User.id'], name='profile_relationship_upfk_1', ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['profession_id'], ['Profession.id'], name='profile_relationship_upfk_2', ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['industry_id'], ['Industry.id'], name='profile_relationship_upfk_3', ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['nationality_id'], ['Country.id'], name='profile_relationship_upfk_4', ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['expertise_id'], ['Expertise.id'], name='profile_relationship_upfk_5', ondelete='CASCADE'),

        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', name='company_relationship_type_unique_name'),
        mysql_collate='utf8mb4_unicode_ci',
        mysql_default_charset='utf8mb4',
        mysql_engine='InnoDB'
    )





def downgrade():
    pass
