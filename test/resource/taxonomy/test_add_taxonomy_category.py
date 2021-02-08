from test.BaseCase import BaseCase
from sqlalchemy.exc import IntegrityError
from unittest.mock import patch


class TestAddTaxonomyCategory(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/taxonomy/add_taxonomy_category")
    def test_ok(self, token):
        payload = {
            "category": "CAT",
        }

        response = self.application.post('/taxonomy/add_taxonomy_category',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(200, response.status_code)
        self.assertEqual(self.db.get_count(self.db.tables["TaxonomyCategory"]), 1)

    @BaseCase.login
    @BaseCase.grant_access("/taxonomy/add_taxonomy_category")
    def test_ko_duplicate_entry(self, token):
        self.db.insert({"name": "CAT1"}, self.db.tables["TaxonomyCategory"])

        payload = {
            "category": "CAT1",
        }

        response = self.application.post('/taxonomy/add_taxonomy_category',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(500, response.status_code)
        self.assertEqual("500 Object already existing", response.status)

    @BaseCase.login
    @BaseCase.grant_access("/taxonomy/add_taxonomy_category")
    @patch('db.db.DB.insert')
    def test_ko_force_integrity_error_out_of_duplicate(self, mock_db_insert, token):
        mock_db_insert.side_effect = IntegrityError(None, None, None)

        payload = {
            "category": "CAT",
        }

        response = self.application.post('/taxonomy/add_taxonomy_category',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(500, response.status_code)
        self.assertEqual(mock_db_insert.call_count, 2)
