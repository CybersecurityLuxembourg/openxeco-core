from config.config import ENVIRONMENT, CORS_DOMAINS


def set_cookie(request, response, name, value, expires=24 * 60 * 60):
    if ENVIRONMENT == "dev":
        response.set_cookie(
            name,
            value=value,
            path="/",
            domain=None,
            secure=True,
            httponly=True,
            expires=expires
        )
    else:
        origin = request.environ['HTTP_ORIGIN']
        domains = [d for d in CORS_DOMAINS.split(",") if d in origin]

        for d in domains:
            response.set_cookie(
                name,
                value=value,
                path="/",
                domain=d,
                secure=True,
                httponly=True,
                expires=expires
            )

    return response
