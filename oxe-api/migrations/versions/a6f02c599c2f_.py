"""empty message

Revision ID: a6f02c599c2f
Revises: 898407c05fd3
Create Date: 2022-07-11 14:09:09.785226

"""
from alembic import op


# revision identifiers, used by Alembic.
revision = 'a6f02c599c2f'
down_revision = '898407c05fd3'
branch_labels = None
depends_on = None


def upgrade():
    op.create_unique_constraint('uq_user_answer', 'FormAnswer', ['form_question_id', 'user_id'])


def downgrade():
    op.drop_constraint('form_answer_ibfk_1', 'FormAnswer', type_="foreignkey")
    op.drop_constraint('form_answer_ibfk_2', 'FormAnswer', type_="foreignkey")
    op.drop_constraint('uq_user_answer', 'FormAnswer', type_="unique")
    op.create_foreign_key('form_answer_ibfk_1', 'FormAnswer', 'FormQuestion', ['form_question_id'], ['id'],
                          ondelete='CASCADE')
    op.create_foreign_key('form_answer_ibfk_2', 'FormAnswer', 'User', ['user_id'], ['id'], ondelete='CASCADE')
