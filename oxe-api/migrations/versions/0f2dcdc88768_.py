"""empty message

Revision ID: 0f2dcdc88768
Revises: cbc009e647f8
Create Date: 2022-09-23 15:08:53.939734

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql


# revision identifiers, used by Alembic.
revision = '0f2dcdc88768'
down_revision = 'cbc009e647f8'
branch_labels = None
depends_on = None


def upgrade():
    op.rename_table('Communication', 'Campaign')
    op.drop_column('Campaign', 'addresses')
    op.add_column('Campaign', sa.Column('template_id', mysql.INTEGER(), nullable=True))
    op.add_column('Campaign', sa.Column('execution_date', mysql.DATETIME(), nullable=True))
    op.add_column('Campaign', sa.Column('name', mysql.VARCHAR(collation='utf8mb4_unicode_ci', length=200),
                                        nullable=True))
    op.alter_column('Campaign', 'subject', type_=mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci',
                                                               length=200), nullable=True)
    op.alter_column('Campaign', 'body', type_=mysql.TEXT(collation='utf8mb4_unicode_ci'), nullable=True)

    op.create_table(
        'CampaignTemplate',
        sa.Column('id', mysql.INTEGER(), autoincrement=True, nullable=False),
        sa.Column('name', mysql.VARCHAR(collation='utf8mb4_unicode_ci', length=200), nullable=True),
        sa.Column('content', mysql.TEXT(charset='utf8mb4', collation='utf8mb4_unicode_ci'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        mysql_collate='utf8mb4_unicode_ci',
        mysql_default_charset='utf8mb4',
        mysql_engine='InnoDB'
    )

    op.create_table(
        'CampaignAddress',
        sa.Column('id', mysql.INTEGER(), autoincrement=True, nullable=False),
        sa.Column('value', mysql.VARCHAR(collation='utf8mb4_unicode_ci', length=200), nullable=False),
        sa.Column('campaign_id', mysql.INTEGER(), nullable=False),
        sa.Column('status', mysql.ENUM('NOT SENT', 'SENT', 'FAIL'), server_default=sa.text("'NOT SENT'"),
                  nullable=False),
        sa.Column('last_execution_date', mysql.DATETIME(), nullable=True),
        sa.Column('send_date', mysql.DATETIME(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['campaign_id'], ['Campaign.id'], name='campaign_address_ibfk_1', ondelete='CASCADE'),
        mysql_collate='utf8mb4_unicode_ci',
        mysql_default_charset='utf8mb4',
        mysql_engine='InnoDB'
    )

    op.alter_column('FormQuestion', 'type', type_=mysql.ENUM('TEXT', 'TEXTAREA', 'CHECKBOX', 'OPTIONS', 'SELECT'),
                    server_default=sa.text("'TEXT'"), nullable=False)


def downgrade():
    op.drop_column('Campaign', 'template_id')
    op.drop_column('Campaign', 'execution_date')
    op.drop_column('Campaign', 'name')
    op.add_column('Campaign', sa.Column('addresses', mysql.TEXT(collation='utf8mb4_unicode_ci'), nullable=True))
    op.alter_column('Campaign', 'subject', type_=mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci',
                                                               length=255), nullable=False)
    op.alter_column('Campaign', 'body', type_=mysql.TEXT(collation='utf8mb4_unicode_ci'), nullable=False)
    op.rename_table('Campaign', 'Communication')

    op.drop_table('CampaignTemplate')
    op.drop_table('CampaignAddress')

    op.alter_column('FormQuestion', 'type', type_=mysql.ENUM('TEXT', 'CHECKBOX', 'OPTIONS', 'SELECT'),
                    server_default=sa.text("'TEXT'"), nullable=False)
