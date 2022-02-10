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

    def insert(self, data, table, commit=True):
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

        return data

    def delete(self, table, filters=None, commit=True):
        if filters is not None:
            q = self.session.query(table)
            for attr, value in filters.items():
                if isinstance(value, list):
                    q = q.filter(getattr(table, attr).in_(value))
                else:
                    q = q.filter(getattr(table, attr) == value)
            q.delete()

            if commit:
                self.session.commit()

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
    # COMPANY     #
    ###############

    def get_filtered_companies(self, filters=None, entities=None):
        filters = {} if filters is None else filters

        query = self.session.query(self.tables["Company"])

        if entities is not None:
            query = query.with_entities(*entities)

        if "ids" in filters and filters['ids'] is not None:
            query = query.filter(self.tables["Company"].id.in_(filters['ids']))

        if "name" in filters and filters['name'] is not None:
            words = filters['name'].lower().split(" ")
            for word in words:
                query = query.filter(or_(func.lower(self.tables["Company"].name).like("%" + word + "%"),
                                         func.lower(self.tables["Company"].website).like("%" + word + "%")))

        if "status" in filters and filters['status'] is not None:
            query = query.filter(self.tables["Company"].status.in_(filters['status']))

        if "ecosystem_role" in filters and filters['ecosystem_role'] is not None:
            ecosystem_roles = filters['ecosystem_role'] if isinstance(filters['ecosystem_role'], list) else \
                filters['ecosystem_role'].split(',')

            ecosystem_role_values = self.session \
                .query(self.tables["TaxonomyValue"]) \
                .with_entities(self.tables["TaxonomyValue"].id) \
                .filter(self.tables["TaxonomyValue"].category == "ECOSYSTEM ROLE") \
                .filter(self.tables["TaxonomyValue"].name.in_(ecosystem_roles)) \
                .subquery()

            assigned_company = self.session \
                .query(self.tables["TaxonomyAssignment"]) \
                .with_entities(self.tables["TaxonomyAssignment"].company) \
                .filter(self.tables["TaxonomyAssignment"].taxonomy_value.in_(ecosystem_role_values)) \
                .subquery()

            query = query.filter(self.tables["Company"].id.in_(assigned_company))

        if "entity_type" in filters and filters['entity_type'] is not None:
            entity_types = filters['entity_type'] if isinstance(filters['entity_type'], list) \
                else filters['entity_type'].split(',')

            entity_type_values = self.session \
                .query(self.tables["TaxonomyValue"]) \
                .with_entities(self.tables["TaxonomyValue"].id) \
                .filter(self.tables["TaxonomyValue"].category == "ENTITY TYPE") \
                .filter(self.tables["TaxonomyValue"].name.in_(entity_types)) \
                .subquery()

            assigned_company = self.session \
                .query(self.tables["TaxonomyAssignment"]) \
                .with_entities(self.tables["TaxonomyAssignment"].company) \
                .filter(self.tables["TaxonomyAssignment"].taxonomy_value.in_(entity_type_values)) \
                .subquery()

            query = query.filter(self.tables["Company"].id.in_(assigned_company))

        if "startup_only" in filters and filters['startup_only'] is True:
            query = query.filter(self.tables["Company"].is_startup.is_(True))

        if "corebusiness_only" in filters and filters['corebusiness_only'] is True:
            query = query.filter(self.tables["Company"].is_cybersecurity_core_business.is_(True))

        if "taxonomy_values" in filters:
            taxonomy_values = filters["taxonomy_values"] if isinstance(filters["taxonomy_values"], list) else \
                [int(value_id) for value_id in filters["taxonomy_values"].split(",") if value_id.isdigit()]

            if len(taxonomy_values) > 0:
                tch = taxonomy_values

                while len(tch) > 0:
                    taxonomy_values = tch
                    tch = self.session\
                        .query(self.tables["TaxonomyValueHierarchy"]) \
                        .filter(self.tables["TaxonomyValueHierarchy"].parent_value.in_(tch)).all()
                    tch = [t.child_value for t in tch]

                companies_filtered_by_taxonomy = self.session \
                    .query(self.tables["TaxonomyAssignment"]) \
                    .with_entities(self.tables["TaxonomyAssignment"].company) \
                    .distinct(self.tables["TaxonomyAssignment"].company) \
                    .filter(self.tables["TaxonomyAssignment"].taxonomy_value.in_(taxonomy_values)) \
                    .subquery()

                query = query.filter(self.tables["Company"].id.in_(companies_filtered_by_taxonomy))

        return query

    ###############
    # ARTICLE     #
    ###############

    def get_filtered_article_query(self, filters=None, user_id=None):
        filters = {} if filters is None else filters

        query = self.session.query(self.tables["Article"])

        if "title" in filters and filters['title'] is not None:
            elements = filters['title'].lower().split(" ")
            for word in elements:
                query = query.filter(or_(func.lower(self.tables["Article"].title).like("%" + word + "%"),
                                         func.lower(self.tables["Article"].abstract).like("%" + word + "%")))

        if "status" in filters:
            query = query.filter(self.tables["Article"].status == filters["status"])

        if "type" in filters:
            elements = filters["type"] if isinstance(filters["type"], list) else filters["type"].split(",")
            query = query.filter(self.tables["Article"].type.in_(elements))

        if "media" in filters:
            query = query.filter(self.tables["Article"].media.in_(["ALL", filters["media"]]))

        if "public_only" in filters and filters["public_only"] is True:
            query = query.filter(self.tables["Article"].handle.isnot(None))
            query = query.filter(self.tables["Article"].status == "PUBLIC")
            query = query.filter(self.tables["Article"].publication_date <= datetime.date.today())

        if "is_created_by_admin" in filters:
            query = query.filter(self.tables["Article"].is_created_by_admin.is_(filters["is_created_by_admin"]))

        if "taxonomy_values" in filters:
            tmp_taxonomy_values = filters["taxonomy_values"] if isinstance(filters["taxonomy_values"], list) \
                else filters["taxonomy_values"].split(",")
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
                    .with_entities(self.tables["ArticleTaxonomyTag"].article) \
                    .distinct(self.tables["ArticleTaxonomyTag"].article) \
                    .filter(self.tables["ArticleTaxonomyTag"].taxonomy_value.in_(taxonomy_values)) \
                    .subquery()

                query = query.filter(self.tables["Article"].id.in_(article_filtered_by_taxonomy))

        if "companies" in filters:
            article_filtered_by_companies = self.session \
                .query(self.tables["ArticleCompanyTag"]) \
                .with_entities(self.tables["ArticleCompanyTag"].article) \
                .distinct(self.tables["ArticleCompanyTag"].article) \
                .filter(self.tables["ArticleCompanyTag"].company.in_(filters["companies"])) \
                .subquery()

            query = query.filter(self.tables["Article"].id.in_(article_filtered_by_companies))

        if "editable" in filters and filters["editable"] is True:
            assignment_subquery = self.session \
                .query(self.tables["UserCompanyAssignment"]) \
                .with_entities(self.tables["UserCompanyAssignment"].company_id) \
                .filter(self.tables["UserCompanyAssignment"].user_id == user_id) \
                .subquery()

            company_subquery = self.session \
                .query(self.tables["ArticleCompanyTag"]) \
                .with_entities(self.tables["ArticleCompanyTag"].article) \
                .filter(self.tables["ArticleCompanyTag"].company.in_(assignment_subquery)) \
                .subquery()

            query = query \
                .filter(self.tables["Article"].id.in_(company_subquery)) \
                .filter(self.tables["Article"].is_created_by_admin.is_(False))

        query = query.order_by(self.tables["Article"].publication_date.desc())

        return query

    def get_tags_of_article(self, article_id):
        companies_filtered_by_taxonomy = self.session \
            .query(self.tables["ArticleTaxonomyTag"]) \
            .with_entities(self.tables["ArticleTaxonomyTag"].taxonomy_value) \
            .filter(self.tables["ArticleTaxonomyTag"].article == article_id) \
            .subquery()

        return self.session \
            .query(self.tables["TaxonomyValue"]) \
            .filter(self.tables["TaxonomyValue"].id.in_(companies_filtered_by_taxonomy)) \
            .all()

    def get_companies_of_article(self, article_id):
        companies_filtered_by_taxonomy = self.session \
            .query(self.tables["ArticleCompanyTag"]) \
            .with_entities(self.tables["ArticleCompanyTag"].company) \
            .filter(self.tables["ArticleCompanyTag"].article == article_id) \
            .subquery()

        return self.session \
            .query(self.tables["Company"]) \
            .filter(self.tables["Company"].id.in_(companies_filtered_by_taxonomy)) \
            .all()

    ###############
    # WORKFORCE   #
    ###############

    def get_latest_workforce(self, company_ids=None):
        sub_query = self.session.query(
            self.tables["Workforce"].company,
            func.max(self.tables["Workforce"].date).label('maxdate')
        ).group_by(self.tables["Workforce"].company).subquery('t2')

        query = self.session.query(self.tables["Workforce"])

        if company_ids is not None:
            query = query.filter(self.tables["Workforce"].company.in_(company_ids))

        query = query.join(
            sub_query,
            and_(
                self.tables["Workforce"].company == sub_query.c.company,
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
            company_image_ids = self.session \
                .query(self.tables["Company"]) \
                .with_entities(self.tables["Company"].image) \
                .subquery()

            query = query.filter(self.tables["Image"].id.in_(company_image_ids))

        if "is_in_generator" in filters:
            query = query.filter(self.tables["Image"].is_in_generator.is_(filters["is_in_generator"]))

        if "search" in filters and len(filters["search"]) > 0:
            words = filters["search"].split(" ")

            for w in words:
                company_image_ids = self.session \
                    .query(self.tables["Company"]) \
                    .with_entities(self.tables["Company"].image) \
                    .filter(self.tables["Company"].name.contains(f"%{w}%")) \
                    .subquery()

                query = query.filter(or_(self.tables["Image"].id.in_(company_image_ids),
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
