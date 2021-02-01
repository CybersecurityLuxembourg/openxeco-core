from flask_restful import Resource
from db.db import DB
from utils.serializer import Serializer
from utils.catch_exception import catch_exception
from flask import request
import datetime
import html2markdown


class GetArticleContent(Resource):

    def __init__(self, db: DB):
        self.db = db

    @catch_exception
    def get(self, id):

        filters = request.args.to_dict()

        # Fetch the info from the DB

        article = self.db.session.query(self.db.tables["Article"]) \
            .filter(self.db.tables["Article"].handle == id) \
            .filter(self.db.tables["Article"].status == "PUBLIC") \
            .filter(self.db.tables["Article"].publication_date <= datetime.date.today()) \
            .all()

        if len(article) < 1:
            return "", "422 The provided article ID does not exist or is not accessible"

        article_version = self.db.session.query(self.db.tables["ArticleVersion"]) \
            .filter(self.db.tables["ArticleVersion"].article_id == article[0].id) \
            .filter(self.db.tables["ArticleVersion"].is_main == 1) \
            .all()

        if len(article_version) < 1:
            return "", "422 The provided article does not have a main version"

        article_content = self.db.session.query(self.db.tables["ArticleBox"]) \
            .filter(self.db.tables["ArticleBox"].article_version_id == article_version[0].id) \
            .all()

        # Format the output

        if "format" in filters:
            if filters["format"] == "markdown":
                tags = Serializer.serialize(self.db.get_tags_of_article(article[0].id), self.db.tables['TaxonomyValue'])
                data = "---\n"
                data += f"title: {article[0].title}\n"
                data += f"type: {article[0].type}\n"
                data += f"date: {article[0].publication_date}\n"
                data += f"abstract: {article[0].abstract}\n"
                data += f"tag: {', '.join([t.name for t in tags])}\n"
                data += "---\n"

                for c in article_content:
                    if c.type == "TITLE1":
                        data += f"#{c.content}\n"
                    elif c.type == "TITLE2":
                        data += f"##{c.content}\n"
                    elif c.type == "TITLE3":
                        data += f"###{c.content}\n"
                    elif c.type == "PARAGRAPH":
                        data += f"{html2markdown.convert(c.content)}\n"
                    elif c.type == "IMAGE":
                        data += f"![sample image](http://localhost:5000/public/get_image/{c.content})\n"
                    elif c.type == "FRAME":
                        data += f"{c.content}\n"

                return data, "200 "

            elif filters["format"] == "html":
                data = "<article>"

                if article[0].image is not None:
                    data += f"<div class='Article-content-cover'><img src='http://localhost:5000/public/get_image/{article[0].image}'/></div>"

                data += f"<h1>{article[0].title}</h1>"

                for c in article_content:
                    if c.type == "TITLE1":
                        data += f"<h2>{c.content}</h2>"
                    elif c.type == "TITLE2":
                        data += f"<h3>{c.content}</h3>"
                    elif c.type == "TITLE3":
                        data += f"<h4>{c.content}</h4>"
                    elif c.type == "PARAGRAPH":
                        data += f"{c.content}"
                    elif c.type == "IMAGE":
                        data += f"<div class='Article-content-image'><img src='http://localhost:5000/public/get_image/{c.content}'/></div>"
                    elif c.type == "FRAME":
                        data += f"{c.content}"

                data += "</article>"
                return data, "200 "

        data = {
            "title": article[0].title,
            "abstract": article[0].abstract,
            "image": article[0].image,
            "publication_date": str(article[0].publication_date),
            "type": article[0].type,
            "content": Serializer.serialize(article_content, self.db.tables["ArticleBox"]),
            "tags": Serializer.serialize(self.db.get_tags_of_article(article[0].id), self.db.tables["TaxonomyValue"])
        }

        return data, "200 "
