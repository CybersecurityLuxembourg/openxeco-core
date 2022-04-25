from urllib3 import ProxyManager
from urllib import request
from config.config import HTTP_PROXY


def get_request(target):
    if HTTP_PROXY is not None:
        http = ProxyManager(HTTP_PROXY)
        response = http.request('GET', target)
        return response.data
    response = request.urlopen(target)  # nosec
    return response.read()
