from flask import jsonify


def build_no_cors_response(json):
    response = jsonify(json)
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response
