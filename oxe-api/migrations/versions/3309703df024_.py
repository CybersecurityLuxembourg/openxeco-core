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
    op.add_column('Company', sa.Column('linkedin_url', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=150), nullable=True))
    op.add_column('Company', sa.Column('twitter_url', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=150), nullable=True))
    op.add_column('Company', sa.Column('youtube_url', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=150), nullable=True))
    op.add_column('Company', sa.Column('discord_url', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=150), nullable=True))
    op.add_column('TaxonomyCategory', sa.Column('sync_node', mysql.INTEGER(), nullable=True))
    op.add_column('TaxonomyCategory', sa.Column('sync_global', mysql.BOOLEAN()))
    op.add_column('TaxonomyCategory', sa.Column('sync_values', mysql.BOOLEAN()))
    op.add_column('TaxonomyCategory', sa.Column('sync_hierarchy', mysql.BOOLEAN()))
    op.create_foreign_key(
        'fk_taxonomycategory_networknode',
        'TaxonomyCategory', 'NetworkNode',
        ['sync_node'], ['id'],
        ondelete="SET NULL",
    )


def downgrade():
    op.drop_column('Company', 'linkedin_url')
    op.drop_column('Company', 'twitter_url')
    op.drop_column('Company', 'youtube_url')
    op.drop_column('Company', 'discord_url')
    op.drop_column('TaxonomyCategory', 'sync_node')
    op.drop_column('TaxonomyCategory', 'sync_global')
    op.drop_column('TaxonomyCategory', 'sync_values')
    op.drop_column('TaxonomyCategory', 'sync_hierarchy')
