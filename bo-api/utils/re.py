import re


def has_password_format(value):
    return re.fullmatch(r'(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[@#$%^&+=!])[A-Za-z0-9@#$%^&+=!]{8,30}', value)


def has_mail_format(value):
    return re.fullmatch(r'^[A-Za-z0-9.+_-]+@[A-Za-z0-9._-]+\.[a-zA-Z]{2,}$', value)


def has_date_format(value):
    return re.fullmatch(r'^([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))$', value)
