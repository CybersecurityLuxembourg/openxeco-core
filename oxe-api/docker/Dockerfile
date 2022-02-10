ARG PYTHON_VERSION=3.8-slim-buster
FROM python:$PYTHON_VERSION

ENV PYTHONUNBUFFERED=1

ARG ENVIRONMENT=production

ENV JWT_SECRET_KEY=k3y_t0_ch4ng3_2A845
ENV DB_DRIVER=mysql+pymysql
ENV DB_NAME=OPENXECO
ENV DB_PORT=3306
ENV DB_HOSTNAME=openxeco-db
ENV DB_USERNAME=openxeco
ENV DB_PASSWORD=openxeco-pwd

ENV MAIL_SERVER=foo_mail_server
ENV MAIL_PORT=foo_mail_port
ENV MAIL_USERNAME=foo_mail_username
ENV MAIL_PASSWORD=foo_mail_password
ENV MAIL_USE_TLS=True
ENV MAIL_USE_SSL=True
ENV MAIL_DEFAULT_SENDER=foo_mail_default_sender@foo.com

ENV IMAGE_FOLDER=/openxeco_media
ENV DOCUMENT_FOLDER=/openxeco_document

VOLUME [ "${IMAGE_FOLDER}" ]
VOLUME [ "${DOCUMENT_FOLDER}" ]

WORKDIR /app

RUN pip install gunicorn[gevent]

COPY requirements.txt /app/
RUN pip install -r requirements.txt

COPY db             /app/db
COPY decorator      /app/decorator
COPY exception      /app/exception
COPY migrations     /app/migrations
COPY resource       /app/resource
COPY template       /app/template
COPY utils          /app/utils

COPY routes.py      /app/
COPY app.py 		/app/app.py

COPY config         /app/config
COPY docker/entrypoint.sh /entrypoint.sh

EXPOSE 5000

CMD /entrypoint.sh