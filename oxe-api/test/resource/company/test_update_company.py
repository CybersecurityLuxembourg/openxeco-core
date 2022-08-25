import datetime

from test.BaseCase import BaseCase


class TestUpdateEntity(BaseCase):

    @BaseCase.login
    @BaseCase.grant_access("/entity/update_entity")
    def test_ok(self, token):
        today = datetime.date.today()

        self.db.insert({
            "id": 2,
            "name": "My Entity",
            "creation_date": today,
            "is_startup": True
        }, self.db.tables["Entity"])

        payload = {
            "id": 2,
            "name": "My Modified Entity",
            "creation_date": (today - datetime.timedelta(days=1)).strftime("%Y-%m-%d"),
            "is_startup": False,
            "status": "INACTIVE",
        }

        response = self.application.post('/entity/update_entity',
                                         headers=self.get_standard_post_header(token),
                                         json=payload)

        entities = self.db.get(self.db.tables["Entity"], {"id": 2})

        self.assertEqual(200, response.status_code)
        self.assertEqual(len(entities), 1)
        self.assertEqual(entities[0].name, "My Modified Entity")
        self.assertEqual(entities[0].creation_date, today - datetime.timedelta(days=1))
        self.assertEqual(entities[0].is_startup, False)
