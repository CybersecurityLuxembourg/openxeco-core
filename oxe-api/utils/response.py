from flask import jsonify
from flask import make_response


def build_no_cors_response(json):
    response = jsonify(json)
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response


def build_no_cors_response_with_type(data, content_type):
    response = make_response(data)
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Content-Type", content_type)
    return response
