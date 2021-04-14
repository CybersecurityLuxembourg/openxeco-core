from test.BaseCase import BaseCase
from sqlalchemy.exc import IntegrityError
from unittest.mock import patch


class TestAddTaxonomyAssignment(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/taxonomy/add_taxonomy_assignment")
    def test_ok(self, token):
        self.db.insert({"id": 1, "name": "My Company"}, self.db.tables["Company"])
        self.db.insert({"name": "CAT1"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"id": 1, "name": "My Value", "category": "CAT1"}, self.db.tables["TaxonomyValue"])

        payload = {
            "company": 1,
            "value": 1,
        }

        response = self.application.post('/taxonomy/add_taxonomy_assignment',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(200, response.status_code)
        self.assertEqual(self.db.get_count(self.db.tables["TaxonomyAssignment"]), 1)

    @BaseCase.login
    @BaseCase.grant_access("/taxonomy/add_taxonomy_assignment")
    def test_ko_assign_from_parent_category(self, token):
        self.db.insert({"id": 1, "name": "My Company"}, self.db.tables["Company"])
        self.db.insert({"name": "CAT1"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"name": "CAT2"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"parent_category": "CAT1", "child_category": "CAT1"},
                       self.db.tables["TaxonomyCategoryHierarchy"])
        self.db.insert({"id": 1, "name": "My Value", "category": "CAT1"}, self.db.tables["TaxonomyValue"])

        payload = {
            "company": 1,
            "value": 1
        }

        response = self.application.post('/taxonomy/add_taxonomy_assignment',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 Cannot assign value from parent category", response.status)

    @BaseCase.login
    @BaseCase.grant_access("/taxonomy/add_taxonomy_assignment")
    def test_ko_object_not_found(self, token):

        payload = {
            "company": 1,
            "value": 1
        }

        response = self.application.post('/taxonomy/add_taxonomy_assignment',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 Object not found", response.status)

    @BaseCase.login
    @BaseCase.grant_access("/taxonomy/add_taxonomy_assignment")
    def test_ko_duplicate_entry(self, token):
        self.db.insert({"id": 1, "name": "My Company"}, self.db.tables["Company"])
        self.db.insert({"name": "CAT1"}, self.db.tables["TaxonomyCategory"])
        self.db.insert({"id": 1, "name": "My Value", "category": "CAT1"}, self.db.tables["TaxonomyValue"])
        self.db.insert({"company": 1, "taxonomy_value": 1}, self.db.tables["TaxonomyAssignment"])

        payload = {
            "company": 1,
            "value": 1
        }

        response = self.application.post('/taxonomy/add_taxonomy_assignment',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 This assignment is already existing", response.status)

    @BaseCase.login
    @BaseCase.grant_access("/taxonomy/add_taxonomy_assignment")
    @patch('db.db.DB.insert')
    def test_ko_force_integrity_error_out_of_duplicate(self, mock_db_insert, token):
        self.db.session.add(self.db.tables["Company"](**{"id": 1, "name": "My Company"}))
        self.db.session.add(self.db.tables["TaxonomyCategory"](**{"name": "CAT1"}))
        self.db.session.commit()
        self.db.session.add(self.db.tables["TaxonomyValue"](**{"id": 1, "name": "My Value", "category": "CAT1"}))
        self.db.session.commit()
        mock_db_insert.side_effect = [IntegrityError(None, None, None), None]

        payload = {
            "company": 1,
            "value": 1
        }

        response = self.application.post('/taxonomy/add_taxonomy_assignment',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(500, response.status_code)
        self.assertEqual(mock_db_insert.call_count, 2)
