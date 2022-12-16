FROM node:latest

WORKDIR /usr/app

COPY ./oxe-web-admin/package.json .
COPY ./oxe-web-admin/package-lock.json .

RUN npm install --quiet

COPY . .