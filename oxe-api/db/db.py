import os
from sqlalchemy import MetaData, create_engine
from sqlalchemy.ext.declarative import declarative_base
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func, and_, or_
from flask_migrate import Migrate, upgrade

import datetime


class SA(SQLAlchemy):
    def apply_pool_defaults(self, app, options):
        SQLAlchemy.apply_pool_defaults(self, app, options)
        options["pool_pre_ping"] = True
        options["pool_recycle"] = 60


class DB:
    def __init__(self, app):

        # Create database in case it is not existing

        uri_without_database = "/".join(str(app.config['SQLALCHEMY_DATABASE_URI']).split("/")[:-1])
        engine = create_engine(uri_without_database)
        engine.execute("CREATE DATABASE IF NOT EXISTS " + app.config['SQLALCHEMY_DATABASE_URI'].database)
        engine.dispose()

        # Init instance

        self.instance = SA(app)
        self.instance.init_app(app)

        self.base = None
        self.session = self.instance.session
        self.engine = self.instance.engine

        # Upgrade the structure to always have the latest version
        migration_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "migrations")
        self.migrate = Migrate(app, self.instance, directory=migration_path)

        with app.app_context():
            upgrade(directory=migration_path)

        # Init the table objects

        self.tables = {}
        self.base = declarative_base()
        self.base.metadata = MetaData(bind=self.instance)

        for table in self.engine.table_names():
            attr = {'__tablename__': table, '__table_args__': {'autoload': True, 'autoload_with': self.engine}}
            self.tables[table] = type(table, (self.base,), attr)

    ###############
    # GLOBAL      #
    ###############

    def merge(self, data, table, commit=True):
        if isinstance(data, dict):
            data = table(**data)
            data = self.session.merge(data)
        elif isinstance(data, list):
            for row in data:
                if isinstance(row, dict):
                    row = table(**row)
                self.session.merge(row)
        else:
            data = self.session.merge(data)

        if commit:
            self.session.commit()

        return data

    def insert(self, data, table, commit=True, flush=False):
        if isinstance(data, dict):
            data = table(**data)
            self.session.add(data)
        else:
            for row in data:
                if isinstance(row, dict):
                    row = table(**row)
                self.session.add(row)

        if commit:
            self.session.commit()
        if flush:
            self.session.flush()

        return data

    def delete(self, table, filters=None, commit=True):
        if filters is not None:
            q = self.session.query(table)
            for attr, value in filters.items():
                if isinstance(value, list):
                    q = q.filter(getattr(table, attr).in_(value))
                else:
                    q = q.filter(getattr(table, attr) == value)
            count = q.delete()

            if commit:
                self.session.commit()

            return count
        return None

    def delete_by_id(self, id_, table):
        self.session.query(table).filter(table.id == id_).delete()
        self.session.commit()

    def truncate(self, table):
        self.session.query(table).delete()
        self.session.commit()

    def get(self, table, filters=None, entities=None):
        filters = {} if filters is None else filters
        q = self.session.query(table)

        if entities is not None:
            q = q.with_entities(*entities)

        for attr, value in filters.items():
            if isinstance(value, list):
                q = q.filter(getattr(table, attr).in_(value))
            elif isinstance(value, bool):
                q = q.filter(getattr(table, attr).is_(value))
            else:
                q = q.filter(getattr(table, attr) == value)

        return q.all()

    def get_count(self, table, filters=None):
        filters = {} if filters is None else filters
        q = self.session.query(table)
        for attr, value in filters.items():
            if isinstance(value, list):
                q = q.filter(getattr(table, attr).in_(value))
            else:
                q = q.filter(getattr(table, attr) == value)
        return q.count()

    def get_by_id(self, id_, table):
        return self.session.query(table).filter(table.id == id_).one()

    ###############
    # UTILS       #
    ###############

    @staticmethod
    def are_objects_equal(a, b, table):
        for c in table.__table__.columns.keys():
            if getattr(a, c) != getattr(b, c):
                return False
        return True

    ###############
    # ENTITY      #
    ###############

    def get_filtered_entities(self, filters=None, entities=None):
        filters = {} if filters is None else filters

        query = self.session.query(self.tables["Entity"])

        if entities is not None:
            query = query.with_entities(*entities)

        if "ids" in filters and filters['ids'] is not None:
            query = query.filter(self.tables["Entity"].id.in_(filters['ids']))

        if "name" in filters and filters['name'] is not None:
            words = filters['name'].lower().split(" ")
            for word in words:
                query = query.filter(or_(func.lower(self.tables["Entity"].name).like("%" + word + "%"),
                                         func.lower(self.tables["Entity"].website).like("%" + word + "%")))

        if "status" in filters and filters['status'] is not None:
            query = query.filter(self.tables["Entity"].status.in_(filters['status']))

        if "legal_status" in filters and filters['legal_status'] is not None:
            query = query.filter(self.tables["Entity"].legal_status.in_(filters['legal_status']))

        if "startup_only" in filters and filters['startup_only'] is True:
            query = query.filter(self.tables["Entity"].is_startup.is_(True))

        if "corebusiness_only" in filters and filters['corebusiness_only'] is True:
            query = query.filter(self.tables["Entity"].is_cybersecurity_core_business.is_(True))

        if "taxonomy_values" in filters:
            taxonomy_values = filters["taxonomy_values"] if isinstance(filters["taxonomy_values"], list) else []

            if len(taxonomy_values) > 0:
                for tv in taxonomy_values:
                    tch_tmp = [tv]
                    tch = [tv]

                    # Get leaves of taxonomy value

                    while len(tch_tmp) > 0:
                        tch = tch_tmp
                        tch_rows = self.session \
                            .query(self.tables["TaxonomyValueHierarchy"]) \
                            .filter(self.tables["TaxonomyValueHierarchy"].parent_value.in_(tch_tmp))\
                            .all()
                        tch_tmp = [t.child_value for t in tch_rows]

                    # Get entities having the tag(s)

                    entities_filtered_by_taxonomy = self.session \
                        .query(self.tables["TaxonomyAssignment"]) \
                        .with_entities(self.tables["TaxonomyAssignment"].entity_id) \
                        .distinct(self.tables["TaxonomyAssignment"].entity_id) \
                        .filter(self.tables["TaxonomyAssignment"].taxonomy_value_id.in_(tch)) \
                        .subquery()

                    query = query.filter(self.tables["Entity"].id.in_(entities_filtered_by_taxonomy))

        return query

    ###############
    # ARTICLE     #
    ###############

    def get_filtered_article_query(self, filters=None, user_id=None, entities=None):  # noqa: disable=MC0001
        filters = {} if filters is None else filters

        query = self.session.query(self.tables["Article"])

        if entities is not None:
            query = query.with_entities(*entities)

        if "ids" in filters and filters['ids'] is not None:
            query = query.filter(self.tables["Article"].id.in_(filters['ids']))

        if "title" in filters and filters['title'] is not None:
            elements = filters['title'].lower().split(" ")
            for word in elements:
                query = query.filter(or_(func.lower(self.tables["Article"].title).like("%" + word + "%"),
                                         func.lower(self.tables["Article"].abstract).like("%" + word + "%")))

        if "status" in filters:
            query = query.filter(self.tables["Article"].status.in_(filters["status"]))

        if "type" in filters:
            elements = filters["type"] if isinstance(filters["type"], list) else filters["type"].split(",")
            query = query.filter(self.tables["Article"].type.in_(elements))

        if "media" in filters:
            query = query.filter(self.tables["Article"].media.in_(["ALL", filters["media"]]))

        if "public_only" in filters and filters["public_only"] is True:
            query = query.filter(self.tables["Article"].handle.isnot(None))
            query = query.filter(self.tables["Article"].status == "PUBLIC")
            query = query.filter(self.tables["Article"].publication_date <= datetime.datetime.now())

        if "is_created_by_admin" in filters:
            query = query.filter(self.tables["Article"].is_created_by_admin.is_(filters["is_created_by_admin"]))

        if "taxonomy_values" in filters:
            taxonomy_values = filters["taxonomy_values"] if isinstance(filters["taxonomy_values"], list) else []

            for tv in taxonomy_values:
                tch_tmp = [tv]
                tch = [tv]

                # Get leaves of taxonomy value

                while len(tch_tmp) > 0:
                    tch = tch_tmp
                    tch_rows = self.session \
                        .query(self.tables["TaxonomyValueHierarchy"]) \
                        .filter(self.tables["TaxonomyValueHierarchy"].parent_value.in_(tch_tmp))\
                        .all()
                    tch_tmp = [t.child_value for t in tch_rows]

                # Get entities having the tag(s)

                article_filtered_by_taxonomy = self.session \
                    .query(self.tables["ArticleTaxonomyTag"]) \
                    .with_entities(self.tables["ArticleTaxonomyTag"].article_id) \
                    .distinct(self.tables["ArticleTaxonomyTag"].article_id) \
                    .filter(self.tables["ArticleTaxonomyTag"].taxonomy_value_id.in_(tch)) \
                    .subquery()

                query = query.filter(self.tables["Article"].id.in_(article_filtered_by_taxonomy))

        if "ignored_taxonomy_values" in filters:
            tmp_taxonomy_values = filters["ignored_taxonomy_values"] \
                if isinstance(filters["ignored_taxonomy_values"], list) \
                else filters["ignored_taxonomy_values"].split(",")
            taxonomy_values = []

            for tv in tmp_taxonomy_values:
                if tv.isdigit():
                    taxonomy_values.append(int(tv))
                else:
                    db_values = self.get(self.tables["TaxonomyValue"], {"name": tv})
                    taxonomy_values += [v.id for v in db_values]

            if len(taxonomy_values) > 0:
                tch = taxonomy_values

                while len(tch) > 0:
                    taxonomy_values = tch
                    tch = self.session \
                        .query(self.tables["TaxonomyValueHierarchy"]) \
                        .filter(self.tables["TaxonomyValueHierarchy"].parent_value.in_(tch)).all()
                    tch = [t.child_value for t in tch]

                article_filtered_by_taxonomy = self.session \
                    .query(self.tables["ArticleTaxonomyTag"]) \
                    .with_entities(self.tables["ArticleTaxonomyTag"].article_id) \
                    .distinct(self.tables["ArticleTaxonomyTag"].article_id) \
                    .filter(self.tables["ArticleTaxonomyTag"].taxonomy_value_id.in_(taxonomy_values)) \
                    .subquery()

                query = query.filter(self.tables["Article"].id.notin_(article_filtered_by_taxonomy))

        if "entities" in filters:
            article_filtered_by_entities = self.session \
                .query(self.tables["ArticleEntityTag"]) \
                .with_entities(self.tables["ArticleEntityTag"].article_id) \
                .distinct(self.tables["ArticleEntityTag"].article_id) \
                .filter(self.tables["ArticleEntityTag"].entity_id.in_(filters["entities"])) \
                .subquery()

            query = query.filter(self.tables["Article"].id.in_(article_filtered_by_entities))

        if "editable" in filters and filters["editable"] is True:
            assignment_subquery = self.session \
                .query(self.tables["UserEntityAssignment"]) \
                .with_entities(self.tables["UserEntityAssignment"].entity_id) \
                .filter(self.tables["UserEntityAssignment"].user_id == user_id) \
                .subquery()

            entity_subquery = self.session \
                .query(self.tables["ArticleEntityTag"]) \
                .with_entities(self.tables["ArticleEntityTag"].article_id) \
                .filter(self.tables["ArticleEntityTag"].entity_id.in_(assignment_subquery)) \
                .subquery()

            query = query \
                .filter(self.tables["Article"].id.in_(entity_subquery)) \
                .filter(self.tables["Article"].is_created_by_admin.is_(False))

        if "min_start_date" in filters:
            query = query.filter(self.tables["Article"].start_date >= filters["min_start_date"])

        if "max_start_date" in filters:
            query = query.filter(self.tables["Article"].start_date <= filters["max_start_date"])

        if "min_end_date" in filters:
            query = query.filter(self.tables["Article"].end_date >= filters["min_end_date"])

        if "max_end_date" in filters:
            query = query.filter(self.tables["Article"].end_date <= filters["max_end_date"])

        if "order_by" in filters:
            if "order" in filters and filters["order"] == "asc":
                query = query.order_by(getattr(self.tables["Article"], filters["order_by"]).asc())
            else:
                query = query.order_by(getattr(self.tables["Article"], filters["order_by"]).desc())
        else:
            if "order" in filters and filters["order"] == "asc":
                query = query.order_by(self.tables["Article"].publication_date.asc())
            else:
                query = query.order_by(self.tables["Article"].publication_date.desc())

        return query

    def get_tags_of_article(self, article_id):
        entities_filtered_by_taxonomy = self.session \
            .query(self.tables["ArticleTaxonomyTag"]) \
            .with_entities(self.tables["ArticleTaxonomyTag"].taxonomy_value_id) \
            .filter(self.tables["ArticleTaxonomyTag"].article_id == article_id) \
            .subquery()

        return self.session \
            .query(self.tables["TaxonomyValue"]) \
            .filter(self.tables["TaxonomyValue"].id.in_(entities_filtered_by_taxonomy)) \
            .all()

    def get_entities_of_article(self, article_id):
        entities_filtered_by_taxonomy = self.session \
            .query(self.tables["ArticleEntityTag"]) \
            .with_entities(self.tables["ArticleEntityTag"].entity_id) \
            .filter(self.tables["ArticleEntityTag"].article_id == article_id) \
            .subquery()

        return self.session \
            .query(self.tables["Entity"]) \
            .filter(self.tables["Entity"].id.in_(entities_filtered_by_taxonomy)) \
            .all()

    ###############
    # WORKFORCE   #
    ###############

    def get_latest_workforce(self, entity_ids=None):
        sub_query = self.session.query(
            self.tables["Workforce"].entity_id,
            func.max(self.tables["Workforce"].date).label('maxdate')
        ).group_by(self.tables["Workforce"].entity_id).subquery('t2')

        query = self.session.query(self.tables["Workforce"])

        if entity_ids is not None:
            query = query.filter(self.tables["Workforce"].entity_id.in_(entity_ids))

        query = query.join(
            sub_query,
            and_(
                self.tables["Workforce"].entity_id == sub_query.c.entity_id,
                self.tables["Workforce"].date == sub_query.c.maxdate
            ))

        return query.all()

    ###############
    # TAXONOMY    #
    ###############

    def get_value_hierarchy(self, parent_category, child_category):
        parent_sub_query = self.session.query(self.tables["TaxonomyValue"].id) \
            .filter(self.tables["TaxonomyValue"].category == parent_category)

        child_sub_query = self.session.query(self.tables["TaxonomyValue"].id) \
            .filter(self.tables["TaxonomyValue"].category == child_category)

        query = self.session.query(self.tables["TaxonomyValueHierarchy"]) \
            .filter(self.tables["TaxonomyValueHierarchy"].parent_value.in_(parent_sub_query)) \
            .filter(self.tables["TaxonomyValueHierarchy"].child_value.in_(child_sub_query)) \

        return query.all()

    ###############
    # IMAGE       #
    ###############

    def get_filtered_image_query(self, filters=None):
        filters = {} if filters is None else filters

        query = self.session.query(self.tables["Image"])

        if "logo_only" in filters and filters["logo_only"] is True:
            entity_image_ids = self.session \
                .query(self.tables["Entity"]) \
                .with_entities(self.tables["Entity"].image) \
                .subquery()

            query = query.filter(self.tables["Image"].id.in_(entity_image_ids))

        if "is_in_generator" in filters:
            query = query.filter(self.tables["Image"].is_in_generator.is_(filters["is_in_generator"]))

        if "search" in filters and len(filters["search"]) > 0:
            words = filters["search"].split(" ")

            for w in words:
                entity_image_ids = self.session \
                    .query(self.tables["Entity"]) \
                    .with_entities(self.tables["Entity"].image) \
                    .filter(self.tables["Entity"].name.contains(f"%{w}%")) \
                    .subquery()

                query = query.filter(or_(self.tables["Image"].id.in_(entity_image_ids),
                                         self.tables["Image"].keywords.contains(f"%{w}%")))

        if "order" in filters and filters["order"] == "desc":
            query = query.order_by(self.tables["Image"].creation_date.desc())
        else:
            query = query.order_by(self.tables["Image"].creation_date.asc())

        return query

    ###############
    # DOCUMENT    #
    ###############

    def get_filtered_document_query(self, filters=None):
        filters = {} if filters is None else filters

        query = self.session.query(self.tables["Document"])

        if "search" in filters and len(filters["search"]) > 0:
            query = query.filter(or_(self.tables["Document"].filename.contains(f"%{filters['search']}%"),
                                     self.tables["Document"].keywords.contains(f"%{filters['search']}%")))

        if "order" in filters and filters["order"] == "desc":
            query = query.order_by(self.tables["Document"].creation_date.desc())
        else:
            query = query.order_by(self.tables["Document"].creation_date.asc())

        return query

    ###############
    # NOTE        #
    ###############

    def get_filtered_note_query(self, filters=None):
        filters = {} if filters is None else filters

        query = self.session.query(self.tables["Note"])

        if "entity_id" in filters:
            query = query.filter(self.tables["Note"].entity_id == filters["entity_id"])

        if "article" in filters:
            query = query.filter(self.tables["Note"].article == filters["article"])

        if "taxonomy_category" in filters:
            query = query.filter(self.tables["Note"].taxonomy_category == filters["taxonomy_category"])

        if "user" in filters:
            query = query.filter(self.tables["Note"].user == filters["user"])

        if "order" in filters and filters["order"] == "desc":
            query = query.order_by(self.tables["Note"].sys_date.desc())
        else:
            query = query.order_by(self.tables["Note"].sys_date.asc())

        return query
