from flask_restful import Resource
from flask_jwt_extended import jwt_required
from db.db import DB
from utils.serializer import Serializer
from decorator.catch_exception import catch_exception
from flask import request
from decorator.log_request import log_request


class GetArticles(Resource):

    def __init__(self, db: DB):
        self.db = db

    @log_request
    @catch_exception
    @jwt_required
    def get(self):

        filters = request.args.to_dict()
        article_objects = self.db.get_filtered_articles(filters)
        data = Serializer.serialize(article_objects, self.db.tables["Article"])

        return data, "200 "
