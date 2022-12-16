FROM node:latest

WORKDIR /usr/app

COPY ./oxe-web-community/package.json .
COPY ./oxe-web-community/package-lock.json .

RUN npm install --quiet

COPY . .
