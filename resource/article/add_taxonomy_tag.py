from flask_restful import Resource
from flask_apispec import MethodResource
from flask_jwt_extended import jwt_required
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access
from decorator.catch_exception import catch_exception
from webargs import fields
from flask_apispec import use_kwargs, doc


class AddTaxonomyTag(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['article'],
         description='Add a company tag to an article',
         responses={
             "200": {},
             "422.a": {"description": "The provided article does not exist"},
             "422.b": {"description": "The provided company does not exist"},
         })
    @use_kwargs({
        'article': fields.Int(),
        'taxonomy_value': fields.Int(),
    })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        if len(self.db.get(self.db.tables["Article"], {"id": kwargs["article"]})) == 0:
            return "", "422 the provided article does not exist"

        if len(self.db.get(self.db.tables["TaxonomyValue"], {"id": kwargs["taxonomy_value"]})) == 0:
            return "", "422 the provided taxonomy value does not exist"

        self.db.insert(kwargs, self.db.tables["ArticleTaxonomyTag"])

        return "", "200 "
