from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_restful import Resource
from webargs import fields, validate

from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from utils.serializer import Serializer


class GetPublicDocuments(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['public'],
         description='Get documents object from the media library',
         responses={
             "200": {},
         })
    @use_kwargs({
        'page': fields.Int(required=False, missing=1, validate=validate.Range(min=1)),
        'per_page': fields.Int(required=False, missing=50, validate=validate.Range(min=1, max=50)),
        'order': fields.Str(required=False, missing='desc', validate=lambda x: x in ['desc', 'asc']),
        'search': fields.Str(required=False, validate=validate.Length(min=3)),
    }, location="query")
    @catch_exception
    def get(self, **kwargs):

        query = self.db.get_filtered_document_query(kwargs)
        paginate = query.paginate(kwargs['page'], kwargs['per_page'])
        documents = Serializer.serialize(paginate.items, self.db.tables["Document"])

        return {
            "pagination": {
                "page": kwargs['page'],
                "pages": paginate.pages,
                "per_page": kwargs['per_page'],
                "total": paginate.total,
            },
            "items": documents,
        }, "200 "
