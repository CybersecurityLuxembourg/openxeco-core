from flask import Response
from flask_apispec import MethodResource
from flask_apispec import doc
from flask_restful import Resource
from sqlalchemy.orm.exc import NoResultFound


from db.db import DB
from decorator.catch_exception import catch_exception


class GetPublicVcard(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @doc(tags=['public'],
         description='Get the vcard of a user by its handle',
         responses={
             "200": {},
             "422.a": {"description": "Object not found"},
             "422.b": {"description": "The user has no vcard"},
             "422.c": {"description": "The vcard of the user is not public"},
         })
    @catch_exception
    def get(self, handle):

        try:
            vcard = self.db.session \
                .query(self.db.tables["User"]) \
                .with_entities(self.db.tables["User"].vcard, self.db.tables["User"].is_vcard_public) \
                .filter(self.db.tables["User"].handle == handle) \
                .one()
        except NoResultFound:
            return "", "422 Object not found"

        if vcard.vcard is None:
            return "", "422 The user has no vcard"

        if vcard.is_vcard_public is True:
            return Response(
                vcard,
                mimetype="text/vcard",
                headers={"Content-disposition": f"attachment; filename={handle}.vcf"}
            )

        return "", "422 The vcard of the user is not public"
