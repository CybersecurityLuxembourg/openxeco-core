from itsdangerous import URLSafeTimedSerializer

from config.config import SECRET_KEY, SECURITY_SALT


def generate_confirmation_token(email):
    serializer = URLSafeTimedSerializer(SECRET_KEY)
    return serializer.dumps(email, salt=SECURITY_SALT)


def confirm_token(token, expiration=3600):
    serializer = URLSafeTimedSerializer(SECRET_KEY)
    return serializer.loads(
        token,
        salt=SECURITY_SALT,
        max_age=expiration
    )