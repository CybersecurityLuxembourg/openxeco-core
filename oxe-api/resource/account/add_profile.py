from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource
from webargs import fields
from sqlalchemy.exc import IntegrityError

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from exception.object_already_existing import ObjectAlreadyExisting


class AddProfile(MethodResource, Resource):

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
        'user_id': fields.Int(),
        'data': fields.Dict(required=True, allow_none=False),
    })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):
        user_id = kwargs["user_id"]

        self.db.merge({
            'id': user_id,
            'first_name': kwargs["data"]['first_name'],
            'last_name': kwargs["data"]['last_name'],
            'telephone': kwargs["data"]['telephone'],
            'status': "ACCEPTED",
            'is_active': 1,
        }, self.db.tables["User"])
        try:
            self.db.insert({
                'user_id': user_id,
                'gender': kwargs["data"]['gender'],
                'sector': kwargs["data"]['sector'],
                'residency': kwargs["data"]['residency'],
                'mobile': kwargs["data"]['mobile'],
                'experience': kwargs["data"]['experience'],
                'domains_of_interest': kwargs["data"]['domains_of_interest'],
                'how_heard': kwargs["data"]['how_heard'],
                'profession_id': kwargs["data"]['profession_id'],
                'industry_id': kwargs["data"]['industry_id'],
                'nationality_id': kwargs["data"]['nationality_id'],
                'expertise_id': kwargs["data"]['expertise_id'],
                'public': kwargs["data"]['public'],
            }, self.db.tables["UserProfile"])
        except IntegrityError as e:
            self.db.session.rollback()
            if "Duplicate entry" in str(e):
                raise ObjectAlreadyExisting
            raise e
        return "", "200 "
