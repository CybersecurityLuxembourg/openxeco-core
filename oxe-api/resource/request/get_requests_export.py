from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from webargs import fields, validate

from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from utils.serializer import Serializer


class GetRequestsExport(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['request'],
         description='Get the requests',
         responses={
             "200": {},
         })
    @use_kwargs({
        'page': fields.Int(required=False, missing=1, validate=validate.Range(min=1)),
        'per_page': fields.Int(required=False, missing=50, validate=validate.Range(min=1, max=50)),
        'order': fields.Str(required=False, missing='desc', validate=lambda x: x in ['desc', 'asc']),
        'status': fields.DelimitedList(fields.Str(), required=False),
        'types': fields.DelimitedList(fields.Str(), required=False),
        'date_from': fields.DateTime(format="%Y-%m-%d", required=False),
        'date_to': fields.DateTime(format="%Y-%m-%d", required=False),
    }, location="query")
    @jwt_required
    @verify_admin_access
    @catch_exception
    def get(self, **kwargs):
        # base query
        query = self.db.session.query(self.db.tables["UserRequest"])
        
        # status filter
        if "status" in kwargs:
            query = query.filter(self.db.tables["UserRequest"].status.in_(kwargs["status"]))
        
        # type filter
        if "types" in kwargs:
            query = query.filter(self.db.tables["UserRequest"].type.in_(kwargs["types"]))
            
        # date filter
        if "date_from" in kwargs:
            query = query.filter(self.db.tables["UserRequest"].submission_date >= kwargs["date_from"])

        if "date_to" in kwargs:
            query = query.filter(self.db.tables["UserRequest"].submission_date <= kwargs["date_to"])

        # order filter
        if "order" in kwargs and kwargs["order"] == "desc":
            query = query.order_by(self.db.tables["UserRequest"].submission_date.desc())
        else:
            query = query.order_by(self.db.tables["UserRequest"].submission_date.asc())
            
        # get
        requests = query.with_entities(
            self.db.tables["Country"].name,
            self.db.tables["Profession"].name,
            self.db.tables["Industry"].name,
            self.db.tables["Expertise"].name,
        ).get()
        # requests = Serializer.serialize(requests, self.db.tables["UserRequest"])
        
        breakpoint()
        

        return {}, "200 "
