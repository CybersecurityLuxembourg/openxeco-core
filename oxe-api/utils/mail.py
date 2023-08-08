from flask_mail import Message


def send_email(mail, subject, recipients, html_body, cc=None, bcc=None):  # pylint: disable=too-many-arguments
    from config.config import MAIL_DEFAULT_SENDER, MAIL_REPLY_TO  # pylint: disable=import-outside-toplevel
    msg = Message(subject, sender=MAIL_DEFAULT_SENDER, recipients=recipients, cc=cc, bcc=bcc, reply_to=MAIL_REPLY_TO)
    msg.html = html_body

    try:
        mail.send(msg)
    except ConnectionRefusedError:
        raise Exception("An error occurred while connecting to the mail server")
