import base64
from datetime import datetime, date
from decimal import Decimal


class Serializer:

    @staticmethod
    def serialize(to_serialize, table_class):
        if isinstance(to_serialize, list):
            serialized_objects = []
            for o in to_serialize:
                serialized_objects.append(Serializer.serialize_object(o, table_class))
        else:
            return Serializer.serialize_object(to_serialize, table_class)

        return serialized_objects

    @staticmethod
    def serialize_object(o, table_class):
        obj = {}

        if o is not None:
            for c in table_class.__table__.columns:
                if isinstance(getattr(o, c.name), datetime):
                    obj[c.name] = getattr(o, c.name).isoformat()
                elif isinstance(getattr(o, c.name), date):
                    obj[c.name] = getattr(o, c.name).isoformat()
                elif isinstance(getattr(o, c.name), Decimal):
                    obj[c.name] = float(getattr(o, c.name))
                elif isinstance(getattr(o, c.name), bytes):
                    obj[c.name] = base64.encodebytes(getattr(o, c.name)).decode('ascii')
                else:
                    obj[c.name] = getattr(o, c.name)
        return obj
