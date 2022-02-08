ARG PYTHON_VERSION=3.8-slim-buster
FROM python:$PYTHON_VERSION

ENV PYTHONUNBUFFERED=1

ARG ENVIRONMENT=production

#ENV JWT_SECRET_KEY
ENV DB_DRIVER=mysql+pymysql
ENV DB_NAME=cyberlux
ENV DB_PORT=3306
ENV DB_HOSTNAME=cyberlux-db
ENV DB_USERNAME=cyberlux
ENV DB_PASSWORD=cyberlux

#ENV MAIL_SERVER
#ENV MAIL_PORT
#ENV MAIL_USERNAME
#ENV MAIL_PASSWORD
ENV MAIL_USE_TLS=True
ENV MAIL_USE_SSL=True
#ENV MAIL_DEFAULT_SENDER

ENV IMAGE_FOLDER=/cyberlux_media

VOLUME [ "${IMAGE_FOLDER}" ]

WORKDIR /app

RUN pip install gunicorn[gevent]

COPY requirements.txt /app/
RUN pip install -r requirements.txt

COPY db             /app/db
COPY decorator      /app/decorator
COPY exception      /app/exception
COPY resource       /app/resource
COPY template       /app/template
COPY utils          /app/utils

COPY routes.py      /app/
COPY application.py /app/application.py

COPY config         /app/config
COPY config/config.py.sample /app/config/config.py
COPY docker/entrypoint.sh /entrypoint.sh

EXPOSE 5000

CMD /entrypoint.sh
