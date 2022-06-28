from test.BaseCase import BaseCase


class TestDeleteWorkforce(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/workforce/delete_workforce")
    def test_ok(self, token):
        self.db.insert({"id": 1, "name": "Company1"}, self.db.tables["Company"])
        self.db.insert({
            "id": 1,
            "company": 1,
            "workforce": 15,
            "date": "2020-01-01",
            "is_estimated": True,
            "source": "Newspaper",
        }, self.db.tables["Workforce"])

        payload = {
            "id": 1
        }

        response = self.application.post('/workforce/delete_workforce',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(200, response.status_code)
        self.assertEqual(self.db.get_count(self.db.tables["Workforce"]), 0)

    @BaseCase.login
    @BaseCase.grant_access("/workforce/delete_workforce")
    def test_delete_unexisting(self, token):
        payload = {
            "id": 1
        }

        response = self.application.post('/workforce/delete_workforce',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 Object not found", response.status)
