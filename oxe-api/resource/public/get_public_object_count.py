import collections

from flask_apispec import MethodResource
from flask_apispec import use_kwargs, doc
from flask_restful import Resource
from webargs import fields
from sqlalchemy import func

from db.db import DB
from decorator.catch_exception import catch_exception
from utils.response import build_no_cors_response


class GetPublicObjectCount(MethodResource, Resource):

    def __init__(self, db: DB):
        self.db = db

    @doc(tags=['public'],
         description='Get the counts for miscellaneous objects.<br/><br/>' +
                     'The count values can be distributed through entities, articles, ' +
                     'articles by types, taxonomy values (see "include_*" params).<br/><br/>' +
                     'The count values can be filtered with taxonomy values ' +
                     '(see "taxonomy_values" param).',
         responses={
             "200": {},
         })
    @use_kwargs({
        'name': fields.Str(required=False, missing=None),
        'taxonomy_values': fields.DelimitedList(fields.Int(), required=False, missing=[]),

        'include_entities': fields.Bool(required=False, missing=True),
        'include_articles': fields.Bool(required=False, missing=True),
        'include_article_types': fields.Bool(required=False, missing=True),
        'include_taxonomy_categories': fields.DelimitedList(fields.Str(), required=False, missing=[]),
    }, location="query")
    @catch_exception
    def get(self, **kwargs):

        ta = self.db.tables["TaxonomyAssignment"]
        att = self.db.tables["ArticleTaxonomyTag"]

        data = {}

        # Manage entities

        entities = self.db.get_filtered_entities(
            {
                "name": kwargs["name"],
                "status": ["ACTIVE"],
                "taxonomy_values": kwargs["taxonomy_values"],
            },
            (self.db.tables["Entity"].id, )
        )

        if kwargs["include_entities"]:
            data["entity"] = {}
            data["entity"]["total"] = entities.count()

        # Manage articles

        articles = self.db.get_filtered_article_query(
            {
                "title": kwargs["name"],
                "status": ["PUBLIC"],
                "taxonomy_values": kwargs["taxonomy_values"],
            },
            entities=(self.db.tables["Article"].id, self.db.tables["Article"].type, )
        ).all()

        if kwargs["include_articles"] or kwargs["include_article_types"]:
            data["article"] = {}

            if kwargs["include_articles"]:
                data["article"]["total"] = len(articles)

            if kwargs["include_article_types"]:
                for t in self.db.tables["Article"].__table__.columns["type"].type.enums:
                    data["article"][t.lower()] = len([a for a in articles if a[1] == t])

        # Manage taxonomy

        if kwargs["include_taxonomy_categories"]:
            data["taxonomy"] = {}

            # Fetch and sort taxonomy values

            values = self.db.get(self.db.tables["TaxonomyValue"], {"category": kwargs["include_taxonomy_categories"]})
            values_per_category = collections.defaultdict(list)

            for v in values:
                k = v.category
                values_per_category[k].append(v)

            # Fetch and count entity assignments for sorted taxonomy values

            assignments = self.db.session \
                .query(ta.taxonomy_value_id, func.count(ta.taxonomy_value_id)) \
                .join(self.db.tables["Entity"],
                      self.db.tables["Entity"].id == ta.entity_id) \
                .filter(self.db.tables["Entity"].id.in_([a[0] for a in entities])) \
                .filter(ta.taxonomy_value_id.in_([v.id for v in values])) \
                .group_by(ta.taxonomy_value_id) \
                .all()

            for k, vs in values_per_category.items():
                if k not in data["taxonomy"]:
                    data["taxonomy"][k] = dict()

                for v in vs:
                    if v.name not in data["taxonomy"][k]:
                        data["taxonomy"][k][v.name] = 0

                    filtered_assignment = [a for a in assignments if a[0] == v.id]

                    if len(filtered_assignment) > 0:
                        data["taxonomy"][k][v.name] += filtered_assignment[0][1]

            # Fetch and count article assignments for sorted taxonomy values

            assignments = self.db.session \
                .query(att.taxonomy_value_id, func.count(att.taxonomy_value_id)) \
                .join(self.db.tables["Article"],
                      self.db.tables["Article"].id == att.article_id) \
                .filter(self.db.tables["Article"].status == "PUBLIC") \
                .filter(self.db.tables["Article"].id.in_([a[0] for a in articles])) \
                .filter(att.taxonomy_value_id.in_([v.id for v in values])) \
                .group_by(att.taxonomy_value_id)

            for k, vs in values_per_category.items():
                if k not in data["taxonomy"]:
                    data["taxonomy"][k] = dict()

                for v in vs:
                    if v.name not in data["taxonomy"][k]:
                        data["taxonomy"][k][v.name] = 0

                    filtered_assignment = [a for a in assignments if a[0] == v.id]

                    if len(filtered_assignment) > 0:
                        data["taxonomy"][k][v.name] += filtered_assignment[0][1]

        return build_no_cors_response(data)
