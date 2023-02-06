import datetime

import html2markdown
from flask import request
from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_restful import Resource
from webargs import fields

from db.db import DB
from decorator.catch_exception import catch_exception
from utils.serializer import Serializer
from utils.response import build_no_cors_response, build_no_cors_response_with_type


class GetPublicArticleContent(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @doc(tags=['public'],
         description='Get content of an article by ID\n'
            + "The format can be 'json', 'markdown' or 'html'. 'json' being the default value.",
         responses={
             "200": {},
             "422.a": {"description": "The provided article ID does not exist or is not accessible"},
             "422.b": {"description": "The provided article does not have a main version"},
         })
    @use_kwargs({
        'format': fields.Str(required=False, missing='json', validate=lambda x: x in ['markdown', 'html', 'json']),
    }, location="query")
    @catch_exception
    def get(self, id_, **kwargs):

        # Fetch the info from the DB

        article = self.db.session.query(self.db.tables["Article"]) \
            .filter((self.db.tables["Article"].id == (int(id_) if id_.isdigit() else id_)) |
                    (self.db.tables["Article"].handle == id_)) \
            .filter(self.db.tables["Article"].status == "PUBLIC") \
            .filter(self.db.tables["Article"].publication_date <= datetime.datetime.now()) \
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

        if "format" in kwargs:
            if kwargs["format"] == "markdown":
                return self.build_markdown(article, article_content)
            if kwargs["format"] == "html":
                return self.build_html(article, article_content)

        data = {
            "title": article[0].title,
            "abstract": article[0].abstract,
            "image": article[0].image,
            "publication_date": article[0].publication_date.strftime('%Y-%m-%dT%H:%M:%S')
            if article[0].publication_date is not None else None,
            "start_date": str(article[0].start_date) if article[0].start_date is not None else None,
            "end_date": str(article[0].end_date) if article[0].end_date is not None else None,
            "type": article[0].type,
            "link": article[0].link,
            "handle": article[0].handle,
            "content": Serializer.serialize(article_content, self.db.tables["ArticleBox"]),
            "taxonomy_tags": Serializer.serialize(
                self.db.get_tags_of_article(article[0].id),
                self.db.tables["TaxonomyValue"]
            ),
            "entity_tags": Serializer.serialize(
                self.db.get_entities_of_article(article[0].id),
                self.db.tables["Entity"]
            )
        }

        return build_no_cors_response(data)

    def build_markdown(self, article, article_content):
        tags = Serializer.serialize(self.db.get_tags_of_article(article[0].id), self.db.tables['TaxonomyValue'])
        data = "---\r\n\r\n"
        data += f"title: {article[0].title}\r\n\r\n"
        data += f"type: {article[0].type}\r\n\r\n"
        data += f"date: {article[0].publication_date}\r\n\r\n"
        data += f"abstract: {article[0].abstract}\r\n\r\n"
        data += f"tag: {', '.join([t['name'] for t in tags])}\r\n\r\n"
        data += "---\r\n\r\n"

        for c in article_content:
            if c.content is not None:
                if c.type == "TITLE1":
                    data += f"# {c.content}\r\n\r\n"
                elif c.type == "TITLE2":
                    data += f"## {c.content}\r\n\r\n"
                elif c.type == "TITLE3":
                    data += f"### {c.content}\r\n\r\n"
                elif c.type == "PARAGRAPH":
                    data += f"{html2markdown.convert(c.content)}\r\n\r\n"
                elif c.type == "IMAGE":
                    data += f"![image]({request.url_root}public/get_public_image/{c.content})\r\n\r\n"
                elif c.type == "FRAME":
                    data += f"{c.content}\r\n\r\n"

        return build_no_cors_response_with_type(data, "text/markdown; charset=utf-8")

    def build_html(self, article, article_content):
        data = "<article>"

        if article[0].image is not None:
            data += f"<div class='Article-content-cover'>" \
                    f"<img src='{request.url_root}public/get_public_image/{article[0].image}'/>" \
                    f"</div>"

        data += f"<h1>{article[0].title}</h1>"

        for c in article_content:
            if c.content is not None:
                if c.type == "TITLE1":
                    data += f"<h2>{c.content}</h2>"
                elif c.type == "TITLE2":
                    data += f"<h3>{c.content}</h3>"
                elif c.type == "TITLE3":
                    data += f"<h4>{c.content}</h4>"
                elif c.type == "PARAGRAPH":
                    data += "<div class='Article-content-paragraph'>" \
                            f"{c.content}" \
                            "</div>"
                elif c.type == "IMAGE":
                    data += f"<div class='Article-content-image'>" \
                            f"<img src='{request.url_root}public/get_public_image/{c.content}'/>" \
                            f"</div>"
                elif c.type == "FRAME":
                    data += f"<div class='Article-content-frame'>" \
                            f"{c.content}" \
                            f"</div>"

        data += "</article>"

        return build_no_cors_response_with_type(data, "text/html; charset=utf-8")
