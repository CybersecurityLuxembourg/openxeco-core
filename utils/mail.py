from flask_mail import Message


def send_email(mail, subject, recipients, html_body):
    msg = Message(subject, sender="alexis.prunier@securitymadein.lu", recipients=recipients)
    msg.html = html_body

    try:
        mail.send(msg)
    except ConnectionRefusedError:
        raise Exception("An error occurred while connecting to the mail server")
