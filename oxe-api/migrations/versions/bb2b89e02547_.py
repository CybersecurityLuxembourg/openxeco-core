"""empty message

Revision ID: bb2b89e02547
Revises: 3309703df024
Create Date: 2022-05-12 14:10:01.139314

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql


# revision identifiers, used by Alembic.
revision = 'bb2b89e02547'
down_revision = '3309703df024'
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column('Article', 'publication_date',
                    type_=sa.DATETIME(), server_default=sa.sql.func.now(), nullable=True)

    op.add_column('Article', sa.Column('sync_node', mysql.INTEGER(), nullable=True))
    op.add_column('Article', sa.Column('sync_global', mysql.BOOLEAN()))
    op.add_column('Article', sa.Column('sync_content', mysql.BOOLEAN()))
    op.add_column('Article', sa.Column('sync_status', mysql.ENUM('OK', 'CONFLICT', 'UNFOUND', 'ERROR'),
                                                server_default=sa.text("'OK'"), nullable=False))
    op.create_foreign_key(
        'fk_article_networknode',
        'TaxonomyCategory', 'NetworkNode',
        ['sync_node'], ['id'],
        ondelete="SET NULL",
    )

    op.add_column('Company', sa.Column('sync_node', mysql.INTEGER(), nullable=True))
    op.add_column('Company', sa.Column('sync_global', mysql.BOOLEAN()))
    op.add_column('Company', sa.Column('sync_address', mysql.BOOLEAN()))
    op.add_column('Company', sa.Column('sync_status', mysql.ENUM('OK', 'CONFLICT', 'UNFOUND', 'ERROR'),
                                                server_default=sa.text("'OK'"), nullable=False))
    op.create_foreign_key(
        'fk_company_networknode',
        'Company', 'NetworkNode',
        ['sync_node'], ['id'],
        ondelete="SET NULL",
    )


def downgrade():
    op.alter_column('Article', 'publication_date',
                    type_=sa.DATE(), server_default=sa.text('(curdate())'), nullable=True)

    op.drop_constraint('fk_article_networknode', 'Article', 'foreignkey')
    op.drop_column('Article', 'sync_node')
    op.drop_column('Article', 'sync_global')
    op.drop_column('Article', 'sync_content')
    op.drop_column('Article', 'sync_status')

    op.drop_constraint('fk_company_networknode', 'Company', 'foreignkey')
    op.drop_column('Company', 'sync_node')
    op.drop_column('Company', 'sync_global')
    op.drop_column('Company', 'sync_address')
    op.drop_column('Company', 'sync_status')
