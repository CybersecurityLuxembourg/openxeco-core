from config.config import ENVIRONMENT


def get_admin_portal_url(request):
    if ENVIRONMENT == "dev":
        return "http://localhost:3000"
    return "".join(["https://admin.", request.host])


def get_community_portal_url(request):
    if ENVIRONMENT == "dev":
        return "http://localhost:3000"
    return "".join(["https://community.", request.host])
