from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import fresh_jwt_required, get_jwt_identity
from flask_restful import Resource
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from utils.serializer import Serializer


class AddNote(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['note'],
         description='Add a note on an entity, an article, a taxonomy category or a user',
         responses={
             "200": {},
             "422.a": {"description": "At least one of those params should be set: entity, article, "
                                      "taxonomy_category, user"},
             "422.b": {"description": "Only one params should be set amongst those: entity, article, "
                                      "taxonomy_category, user"},
         })
    @use_kwargs({
        'content': fields.Str(required=False),
        'entity_id': fields.Int(required=False),
        'article': fields.Int(required=False),
        'taxonomy_category': fields.Str(required=False),
        'user': fields.Int(required=False),
    })
    @fresh_jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        param_count = len([1 for t in ["article", "entity_id", "taxonomy_category", "user"] if t in kwargs])

        if param_count == 0:
            return "", "422 At least one of those params should be set: entity_id, article, taxonomy_category, user"
        if param_count > 1:
            return "", "422 Only one params should be set amongst those: entity_id, article, taxonomy_category, user"

        kwargs["admin"] = int(get_jwt_identity())

        note = self.db.insert(kwargs, self.db.tables["Note"])

        return Serializer.serialize(note, self.db.tables["Note"]), "200 "
