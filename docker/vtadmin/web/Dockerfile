FROM node:12

WORKDIR /usr/src/app

COPY ./web/vtadmin/package*.json ./

RUN npm install

COPY ./web/vtadmin .

RUN npm run build

EXPOSE 80

ADD ./docker/vtadmin/web/entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
