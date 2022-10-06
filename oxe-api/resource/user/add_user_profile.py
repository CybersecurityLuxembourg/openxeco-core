from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource
from webargs import fields
from sqlalchemy.exc import IntegrityError

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from exception.object_already_existing import ObjectAlreadyExisting


class AddUserProfile(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['user'],
         description='Add a user profile',
         responses={
             "200": {},
             "422.a": {"description": "Object already existing"},
         })
    @use_kwargs({
        'first_name': fields.Str(),
        'last_name': fields.Str(),
        'telephone': fields.Str(),
        'gender': fields.Str(
            validate=lambda x: x in ["Male", "Female", "Non-binary", "Other", "Prefer not to say"],
        ),
        'sector': fields.Str(validate=lambda x: x in ["Private", "Public"]),
        'residency': fields.Str(validate=lambda x: x in ["Malta", "Gozo", "Outside of Malta"]),
        'mobile': fields.Str(),
        'experience': fields.Str(validate=lambda x: x in ["Student", "0 - 2", "2 - 5", "5 - 10", "10+"]),
        'domains_of_interest': fields.Str(),
        'how_heard': fields.Str(validate=lambda x: x in ["Social Media", "TV Advert", "Friend/Colleague", "Government Website", "European Commission", "Other"]),
        'profession_id': fields.Int(),
        'industry_id': fields.Int(),
        'nationality_id': fields.Int(),
        'expertise_id': fields.Int(),
    })
    @jwt_required
    @catch_exception
    def post(self, **kwargs):
        user_id = get_jwt_identity()
        try:
            self.db.merge({
                'id': user_id,
                'first_name': kwargs['first_name'],
                'last_name': kwargs['last_name'],
                'telephone': kwargs['telephone'],
            }, self.db.tables["User"])
            self.db.insert({
                'user_id': user_id,
                'gender': kwargs['gender'],
                'sector': kwargs['sector'],
                'residency': kwargs['residency'],
                'mobile': kwargs['mobile'],
                'experience': kwargs['experience'],
                'domains_of_interest': kwargs['domains_of_interest'],
                'how_heard': kwargs['how_heard'],
                'profession_id': kwargs['profession_id'],
                'industry_id': kwargs['industry_id'],
                'nationality_id': kwargs['nationality_id'],
                'expertise_id': kwargs['expertise_id'],
            }, self.db.tables["UserProfile"])
        except IntegrityError as e:
            self.db.session.rollback()
            if "Duplicate entry" in str(e):
                raise ObjectAlreadyExisting
            raise e
        return "", "200 "
