import random
import secrets
import string


def generate_password():
    special_chars = "@#$%^&+=!"

    pwd = list()
    pwd.append(string.ascii_lowercase[secrets.randbelow(len(string.ascii_lowercase))])
    pwd.append(string.ascii_uppercase[secrets.randbelow(len(string.ascii_uppercase))])
    pwd.append(string.digits[secrets.randbelow(len(string.digits))])
    pwd.append(special_chars[secrets.randbelow(len(special_chars))])

    all_chars = string.ascii_lowercase + string.ascii_uppercase + string.digits + special_chars

    for _ in range(0, 12):
        pwd.append(all_chars[secrets.randbelow(len(all_chars))])

    random.shuffle(pwd)

    return ''.join(pwd)
