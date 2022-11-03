"""empty message

Revision ID: 8692e9512214
Revises: 0e7cf2c7e4b1
Create Date: 2022-11-03 05:28:09.439836

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '8692e9512214'
down_revision = '0e7cf2c7e4b1'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('EntityContact', sa.Column('user_id', mysql.INTEGER(), nullable=True))
    op.create_foreign_key("contact_relationshup_ibfk_1", 'EntityContact', "User", ['user_id'], ['id'])

def downgrade():
    op.drop_constraint("contact_relationshup_ibfk_1", "EntityContact", "foreignkey")
    op.drop_column('EntityContact', 'user_id')
