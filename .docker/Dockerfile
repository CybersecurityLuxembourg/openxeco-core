FROM python:latest

ENV PYTHONUNBUFFERED=1

ARG ENVIRONMENT=development

WORKDIR /usr/app

RUN pip install gunicorn[gevent]

COPY oxe-api/requirements.txt /usr/app/
RUN pip install -r requirements.txt

COPY oxe-api/* /usr/app/

COPY .docker/entrypoint.sh /entrypoint.sh

COPY . .

RUN chmod +x /entrypoint.sh

CMD /entrypoint.sh
