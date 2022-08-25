import datetime

from test.BaseCase import BaseCase
from utils.serializer import Serializer


class TestSerializer(BaseCase):

    def test_ok_serialize_object(self):
        self.db.insert({
            "name": "My entity",
            "creation_date": "2020-06-06",
            "is_startup": True,
        }, self.db.tables["Entity"])

        entity = self.db.get(self.db.tables["Entity"])[0]

        res = Serializer.serialize_object(entity, self.db.tables["Entity"])

        self.assertEqual(res["name"], "My entity")
        self.assertEqual(res["creation_date"], "2020-06-06")
        self.assertEqual(res["is_startup"], True)

    def test_ok_serialize_with_object(self):
        self.db.insert({
            "name": "My entity",
            "creation_date": "2020-06-06",
            "is_startup": True,
        }, self.db.tables["Entity"])

        entity = self.db.get(self.db.tables["Entity"])[0]

        res = Serializer.serialize(entity, self.db.tables["Entity"])

        self.assertEqual(res["name"], "My entity")
        self.assertEqual(res["creation_date"], "2020-06-06")
        self.assertEqual(res["is_startup"], True)

    def test_ok_serialize_with_list(self):
        self.db.insert({
            "name": "My entity",
            "creation_date": "2020-06-06",
            "is_startup": True,
        }, self.db.tables["Entity"])
        self.db.insert({
            "name": "My entity 2",
            "creation_date": "2020-06-06",
            "is_startup": True,
        }, self.db.tables["Entity"])

        entities = self.db.get(self.db.tables["Entity"])

        res = Serializer.serialize(entities, self.db.tables["Entity"])

        self.assertEqual(len(res), 2)
        self.assertEqual(res[0]["name"], "My entity")
        self.assertEqual(res[0]["creation_date"], "2020-06-06")
        self.assertEqual(res[0]["is_startup"], True)
        self.assertEqual(res[1]["name"], "My entity 2")
        self.assertEqual(res[1]["creation_date"], "2020-06-06")
        self.assertEqual(res[1]["is_startup"], True)

    def test_ok_serialize_with_bytes(self):
        self.db.insert({
            "id": 51,
            "thumbnail": bytes("", encoding='utf8'),
            "width": 10,
            "height": 10,
            "creation_date": datetime.datetime.today()
        }, self.db.tables["Image"])

        image = self.db.get(self.db.tables["Image"])[0]

        Serializer.serialize(image, self.db.tables["Image"])
