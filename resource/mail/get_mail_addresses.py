from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from webargs import fields

from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from decorator.verify_admin_access import verify_admin_access


class GetMailAddresses(MethodResource, Resource):

    def __init__(self, db):
        self.db = db

    @log_request
    @doc(tags=['mail'],
         description='Get the email addresses from the active users and the company contacts',
         responses={
             "200": {},
         })
    @use_kwargs({
        'companies': fields.Str(),
        'taxonomies': fields.Str(),
        'include_contacts': fields.Bool(required=False, allow_none=True, missing=True),
        'include_users': fields.Bool(required=False, allow_none=True, missing=True),
    }, location="query")
    @jwt_required
    @verify_admin_access
    @catch_exception
    def get(self, **kwargs):

        addresses = []

        if kwargs["include_contacts"] is True:
            contacts = self.db.get(
                self.db.tables["CompanyContact"],
                {"type": "EMAIL ADDRESS"},
                ["value", "representative", "name"]
            )

            for c in contacts:
                addresses.append({
                    "source": "CONTACT OF COMPANY",
                    "email": c.value,
                    "information": f"{c.representative} : {c.name}"
                })

        if kwargs["include_users"] is True:
            users = self.db.get(
                self.db.tables["User"],
                {"is_active": True},
                ["email", "last_name", "first_name"]
            )

            for u in users:
                addresses.append({
                    "source": "USER",
                    "email": u.email,
                    "information": f"{u.first_name} {u.last_name}"
                })

        return addresses, "200 "
