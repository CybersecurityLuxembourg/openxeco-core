from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import fresh_jwt_required
from flask_restful import Resource
from webargs import fields, validate

from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from utils.serializer import Serializer


class GetNotes(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['note'],
         description='Get notes from an entity, an article, a taxonomy category or a user',
         responses={
             "200": {},
             "422": {"description": "Maximum one params should be set amongst those: entity, article, "
                                      "taxonomy_category, user"},
         })
    @use_kwargs({
        'page': fields.Int(required=False, missing=1, validate=validate.Range(min=1)),
        'per_page': fields.Int(required=False, missing=10, validate=validate.Range(min=1, max=10)),
        'order': fields.Str(required=False, missing='desc', validate=lambda x: x in ['desc', 'asc']),
        'entity_id': fields.Int(required=False),
        'article': fields.Int(required=False),
        'taxonomy_category': fields.Str(required=False),
        'user': fields.Int(required=False),
    }, location="query")
    @fresh_jwt_required
    @verify_admin_access
    @catch_exception
    def get(self, **kwargs):

        param_count = len([1 for t in ["article", "entity", "taxonomy_category", "user"] if t in kwargs])

        if param_count > 1:
            return "", "422 Maximum one params should be set amongst those: entity, article, taxonomy_category, user"

        note_query = self.db.get_filtered_note_query(kwargs)

        pagination = note_query.paginate(kwargs["page"], kwargs["per_page"])
        data = Serializer.serialize(pagination.items, self.db.tables["Note"])

        return {
           "pagination": {
               "page": kwargs["page"],
               "pages": pagination.pages,
               "per_page": kwargs["per_page"],
               "total": pagination.total,
           },
           "items": data,
        }, "200 "
