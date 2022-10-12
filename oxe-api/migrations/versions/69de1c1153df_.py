"""empty message

Revision ID: 69de1c1153df
Revises: ffe1fcdacc7d
Create Date: 2022-09-19 17:42:15.959499

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql


# revision identifiers, used by Alembic.
revision = '69de1c1153df'
down_revision = 'f8a016bff579'
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column('Entity', 'headline', type_=mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=100), nullable=True)

    op.add_column('User', sa.Column('status', mysql.ENUM('NEW', 'VERIFIED', 'REQUESTED', 'ACCEPTED', 'REJECTED'), server_default=sa.text("'NEW'"), nullable=False)),

    op.add_column('UserRequest', sa.Column('file', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=255), nullable=True))
    op.alter_column('UserRequest', 'status', type_=mysql.ENUM('NEW', 'IN PROCESS', 'ACCEPTED', 'REJECTED'), server_default=sa.text("'NEW'"), nullable=False),
    op.alter_column('UserRequest', 'type', type_=mysql.ENUM('ENTITY ADD', 'ENTITY CHANGE', 'ENTITY ASSOCIATION CLAIM', 'ENTITY ADDRESS CHANGE', 'ENTITY ADDRESS ADD',
                                 'ENTITY ADDRESS DELETION', 'ENTITY TAXONOMY CHANGE', 'ENTITY LOGO CHANGE', 'NEW INDIVIDUAL ACCOUNT'), nullable=True)

    op.alter_column('EntityContact', 'department', type_=mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=110), nullable=True)
    op.alter_column('UserEntityAssignment', 'department', type_=mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=110), nullable=True)

    op.add_column('EntityContact', sa.Column('work_email', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=110), nullable=True))
    op.add_column('EntityContact', sa.Column('seniority_level', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=110), nullable=True))
    op.add_column('EntityContact', sa.Column('work_telephone', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=110), nullable=True))    

    op.add_column('Entity', sa.Column('entity_type', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=110), nullable=True))
    op.add_column('Entity', sa.Column('size', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=110), nullable=True))
    op.add_column('Entity', sa.Column('sector', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=110), nullable=True))
    op.add_column('Entity', sa.Column('industry', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=110), nullable=True))
    op.add_column('Entity', sa.Column('involvement', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=110), nullable=True))
    op.add_column('Entity', sa.Column('vat_number', mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=110), nullable=True))

def downgrade():
    op.alter_column('Entity', 'headline', type_=mysql.VARCHAR(charset='utf8mb4', collation='utf8mb4_unicode_ci', length=50), nullable=True)

    op.drop_column('User', 'status')

    sa.alter_column('UserRequest', 'status', type_=mysql.ENUM('NEW', 'IN PROCESS', 'PROCESSED', 'REJECTED'), server_default=sa.text("'NEW'"), nullable=False),
    sa.alter_column('UserRequest', 'type', type_=mysql.ENUM('ENTITY ADD', 'ENTITY CHANGE', 'ENTITY ACCESS CLAIM', 'ENTITY ADDRESS CHANGE', 'ENTITY ADDRESS ADD',
                                 'ENTITY ADDRESS DELETION', 'ENTITY TAXONOMY CHANGE', 'ENTITY LOGO CHANGE'), nullable=True)

    op.alter_column('EntityContact', 'department', type_=mysql.ENUM('TOP MANAGEMENT', 'HUMAN RESOURCE', 'MARKETING', 'FINANCE', 'OPERATION/PRODUCTION',
                                       'INFORMATION TECHNOLOGY', 'OTHER'), nullable=True)
    op.alter_column('UserEntityAssignment', 'department', type_=mysql.ENUM('TOP MANAGEMENT', 'HUMAN RESOURCE', 'MARKETING',
                                                     'FINANCE', 'OPERATION/PRODUCTION',
                                                     'INFORMATION TECHNOLOGY',
                                                     'OTHER'), nullable=True)

    op.drop_column('UserRequest', 'file')

    op.drop_column('EntityContact', 'work_email')
    op.drop_column('EntityContact', 'seniority_level')
    op.drop_column('EntityContact', 'work_telephone')

    op.drop_column('Entity', 'entity_type')
    op.drop_column('Entity', 'size')
    op.drop_column('Entity', 'sector')
    op.drop_column('Entity', 'industry')
    op.drop_column('Entity', 'involvement')
    op.drop_column('Entity', 'vat_number')
