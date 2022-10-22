from email.mime.image import MIMEImage
from flask_mail import Message




def send_email(mail, subject, recipients, html_body, cc=None, bcc=None):  # pylint: disable=too-many-arguments
    from config.config import MAIL_DEFAULT_SENDER  # pylint: disable=import-outside-toplevel
    msg = Message(
        subject,
        sender=("Do Not Reply NCC Malta at MITA", MAIL_DEFAULT_SENDER),
        recipients=recipients,
        cc=cc,
        bcc=bcc
    )
    msg.html = html_body

    with open("resource/static/eccclogo.png", 'rb') as f:
        msg.attach(
            "logo.png",
            "image/png",
            f.read(),
            "inline",
            headers=[
                ['Content-ID','<logo>'],
            ]
        )

    try:
        mail.send(msg)
    except ConnectionRefusedError:
        raise Exception("An error occurred while connecting to the mail server")


def send_email_with_attachment(mail, subject, recipients, html_body, file_name, file_type, cc=None, bcc=None):  # pylint: disable=too-many-arguments
    from config.config import MAIL_DEFAULT_SENDER  # pylint: disable=import-outside-toplevel
    msg = Message(
        subject,
        sender=("Do Not Reply NCC Malta at MITA", MAIL_DEFAULT_SENDER),
        recipients=recipients,
        cc=cc,
        bcc=bcc
    )
    msg.html = html_body

    with open("resource/static/eccclogo.png", 'rb') as f:
        msg.attach(
            "logo.png",
            "image/png",
            f.read(),
            "inline",
            headers=[
                ['Content-ID','<logo>'],
            ]
        )

    with open(f"resource/static/{file_name}", 'rb') as f:
        msg.attach(file_name, file_type, f.read())
    try:
        mail.send(msg)
    except ConnectionRefusedError:
        raise Exception("An error occurred while connecting to the mail server")
