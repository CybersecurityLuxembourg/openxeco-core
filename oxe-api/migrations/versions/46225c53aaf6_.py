"""empty message

Revision ID: 46225c53aaf6
Revises: 69de1c1153df
Create Date: 2022-10-10 12:42:15.818582

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '46225c53aaf6'
down_revision = '69de1c1153df'
branch_labels = None
depends_on = None


def upgrade():

    op.create_table('Location',
        sa.Column('id', mysql.INTEGER(), autoincrement=True, nullable=False),
        sa.Column('name', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=110), nullable=True),

        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name', name='location_relationship_type_unique_name'),
        mysql_collate='utf8mb4_unicode_ci',
        mysql_default_charset='utf8mb4',
        mysql_engine='InnoDB'
    )

    op.create_table('Sector',
        sa.Column('id', mysql.INTEGER(), autoincrement=True, nullable=False),
        sa.Column('name', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=110), nullable=True),
        sa.Column('industries', mysql.TEXT(charset='utf8mb4', collation='utf8mb4_unicode_ci'), nullable=True),

        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name', name='sector_relationship_type_unique_name'),
        mysql_collate='utf8mb4_unicode_ci',
        mysql_default_charset='utf8mb4',
        mysql_engine='InnoDB'
    )

    op.create_table('Involvement',
        sa.Column('id', mysql.INTEGER(), autoincrement=True, nullable=False),
        sa.Column('name', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=110), nullable=True),
        sa.Column('description', mysql.TEXT(charset='utf8mb4', collation='utf8mb4_unicode_ci'), nullable=True),

        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name', name='involvement_relationship_type_unique_name'),
        mysql_collate='utf8mb4_unicode_ci',
        mysql_default_charset='utf8mb4',
        mysql_engine='InnoDB'
    )

    op.create_table('Department',
        sa.Column('id', mysql.INTEGER(), autoincrement=True, nullable=False),
        sa.Column('name', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=110), nullable=True),

        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name', name='department_relationship_type_unique_name'),
        mysql_collate='utf8mb4_unicode_ci',
        mysql_default_charset='utf8mb4',
        mysql_engine='InnoDB'
    )


def downgrade():
    op.drop_table('Location')
    op.drop_table('Sector')
    op.drop_table('Involvement')
    op.drop_table('Department')
