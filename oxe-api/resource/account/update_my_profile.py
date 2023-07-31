from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request


class UpdateMyProfile(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['account'],
         description='Add a user profile',
         responses={
             "200": {},
             "422.a": {"description": "Object already existing"},
         })
    @use_kwargs({
        'data': fields.Dict(required=True, allow_none=False),
    })
    @jwt_required
    @catch_exception
    def post(self, **kwargs):
        user_id = get_jwt_identity()
        db_profile = self.db.get(self.db.tables["UserProfile"], {"user_id": get_jwt_identity()})
        profile = kwargs["data"]

        self.db.merge({
            'id': user_id,
            'first_name': profile['first_name'],
            'last_name': profile['last_name'],
            'telephone': profile['telephone'],
        }, self.db.tables["User"])

        self.db.merge({
            'id': db_profile[0].id,
            'user_id': user_id,
            'gender': profile['gender'],
            'sector': profile['sector'],
            'residency': profile['residency'],
            'mobile': profile['mobile'],
            'experience': profile['experience'],
            'domains_of_interest': profile['domains_of_interest'],
            'how_heard': profile['how_heard'],
            'profession_id': profile['profession_id'],
            'industry_id': profile['industry_id'],
            'nationality_id': profile['nationality_id'],
            'expertise_id': profile['expertise_id'],
        }, self.db.tables["UserProfile"])

        return "", "200 "
