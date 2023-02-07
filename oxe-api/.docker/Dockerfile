FROM python:latest

ENV PYTHONUNBUFFERED=1

ARG ENVIRONMENT=dev

WORKDIR /usr/app

RUN pip install gunicorn[gevent]

COPY oxe-api/.docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY oxe-api/requirements.txt requirements.txt
RUN pip install -r requirements.txt

CMD /entrypoint.sh