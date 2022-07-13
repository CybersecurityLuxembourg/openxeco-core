
def get_admin_post_resources(api):
    routes = []

    for route in api.app.url_map.iter_rules():
        if "/get_" not in str(route) \
                and "/private/" not in str(route) \
                and "/doc/" not in str(route) \
                and "/flask-apispec/" not in str(route) \
                and str(route) not in ["/static/<path:filename>", "/<generic>", "/account/forgot_password",
                                       "/account/create_account", "/account/refresh", "/healthz", "/doc", "/"]:
            routes.append('%s' % route)

    return routes
