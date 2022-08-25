from test.BaseCase import BaseCase


class TestDeleteContact(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/contact/delete_contact")
    def test_ok(self, token):
        self.db.insert({"id": 2, "name": "My Entity"}, self.db.tables["Entity"])
        self.db.insert({
            "id": 1,
            "entity_id": 2,
            "type": "PHONE NUMBER",
            "representative": "ENTITY",
            "name": None,
            "value": "+123456896",
        }, self.db.tables["EntityContact"])

        payload = {
            "id": 1
        }

        response = self.application.post('/contact/delete_contact',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual(200, response.status_code)
        self.assertEqual(self.db.get_count(self.db.tables["EntityContact"]), 0)

    @BaseCase.login
    @BaseCase.grant_access("/contact/delete_contact")
    def test_delete_unexisting(self, token):
        payload = {
            "id": 1
        }

        response = self.application.post('/contact/delete_contact',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        self.assertEqual("422 Object not found", response.status)
