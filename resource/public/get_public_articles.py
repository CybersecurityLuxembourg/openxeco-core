from flask_restful import Resource
from db.db import DB
from utils.serializer import Serializer
from utils.catch_exception import catch_exception
from flask import request


class GetPublicArticles(Resource):

    def __init__(self, db: DB):
        self.db = db

    @catch_exception
    def get(self):

        filters = request.args.to_dict()
        filters["public_only"] = "true"
        article_objects = self.db.get_filtered_articles(filters)
        data = Serializer.serialize(article_objects, self.db.tables["Article"])

        return data, "200 "
