import string
import random


def generate_password():
    special_chars = "@#$%^&+=!"

    pwd = list()
    pwd.append(random.choice(string.ascii_lowercase))
    pwd.append(random.choice(string.ascii_uppercase))
    pwd.append(random.choice(string.digits))
    pwd.append(random.choice(special_chars))

    all_chars = string.ascii_lowercase + string.ascii_uppercase + string.digits + special_chars

    for i in range(0, 12):
        pwd.append(random.choice(all_chars))

    random.shuffle(pwd)

    return ''.join(pwd)
