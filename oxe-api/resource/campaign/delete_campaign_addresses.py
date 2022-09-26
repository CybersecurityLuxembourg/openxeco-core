from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access


class DeleteCampaignAddresses(MethodResource, Resource):

    db = None

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['campaign'],
         description='Delete addresses related to campaigns',
         responses={
             "200": {},
         })
    @use_kwargs({
        'ids': fields.Int(),
    })
    @jwt_required
    @verify_admin_access
    @catch_exception
    def post(self, **kwargs):

        count = self.db.delete(
            self.db.tables["CampaignAddress"],
            {"id": kwargs["ids"]}
        )

        return "", f"200 {count} address{'es' if count > 1 else ''} deleted"
