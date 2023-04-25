"""empty message

Revision ID: 67bbc1731e7a
Revises: 7855a5f3f5f1
Create Date: 2023-03-09 08:41:40.116004

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql


# revision identifiers, used by Alembic.
revision = '67bbc1731e7a'
down_revision = '7855a5f3f5f1'
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column('ArticleBox', 'type', type_=mysql.ENUM('PARAGRAPH', 'TITLE1', 'TITLE2', 'TITLE3', 'IMAGE', 'FRAME', 'MERMAID'), server_default=sa.text("'PARAGRAPH'"), nullable=False)

    # Fix column nullable status

    op.alter_column('UserRequest', 'entity_id', existing_type=mysql.INTEGER(), nullable=True)
    
    # Change UserRequest to adapt to the new resource: public/add_public_request

    op.alter_column('UserRequest', 'user_id', existing_type=mysql.INTEGER(), nullable=True)
    op.alter_column('UserRequest', 'type', type_=mysql.ENUM('ENTITY ADD', 'ENTITY CHANGE', 'ENTITY ACCESS CLAIM', 'ENTITY ADDRESS CHANGE', 'ENTITY ADDRESS ADD',
                                                            'ENTITY ADDRESS DELETION', 'ENTITY TAXONOMY CHANGE', 'ENTITY LOGO CHANGE', 'CONTACT FORM'), nullable=True)


def downgrade():
    op.alter_column('ArticleBox', 'type', type_=mysql.ENUM('PARAGRAPH', 'TITLE1', 'TITLE2', 'TITLE3', 'IMAGE', 'FRAME'), server_default=sa.text("'PARAGRAPH'"), nullable=False)

    op.alter_column('UserRequest', 'user_id', existing_type=mysql.INTEGER(), nullable=False)
    op.alter_column('UserRequest', 'type', type_=mysql.ENUM('ENTITY ADD', 'ENTITY CHANGE', 'ENTITY ACCESS CLAIM', 'ENTITY ADDRESS CHANGE', 'ENTITY ADDRESS ADD',
                                                            'ENTITY ADDRESS DELETION', 'ENTITY TAXONOMY CHANGE', 'ENTITY LOGO CHANGE'), nullable=True)