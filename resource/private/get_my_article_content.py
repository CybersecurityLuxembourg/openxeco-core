from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource
from webargs import fields, validate

from db.db import DB
from decorator.catch_exception import catch_exception
from decorator.log_request import log_request
from utils.serializer import Serializer


class GetMyArticleContent(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @doc(tags=['private'],
         description='Get the content of an article editable by the user authenticated by the token',
         responses={
             "200": {},
         })
    @jwt_required
    @catch_exception
    def get(self, id_):

        articles = self.db.get(self.db.tables["Company"], {"id": id_})

        if len(articles) < 1:
            return "", "422 Article ID not found"

        data = Serializer.serialize(articles[0], self.db.tables["Article"])

        return data, "200 "
