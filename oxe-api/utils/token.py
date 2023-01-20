import random
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

def generate_otp(otp_size = 6):
    final_otp = ''
    for _ in range(otp_size):
        final_otp = final_otp + str(random.randint(0,9))
    return final_otp
