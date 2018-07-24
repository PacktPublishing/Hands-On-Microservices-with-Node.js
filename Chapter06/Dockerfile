FROM node
MAINTAINER Diogo Resende

ADD imagini/imagini.js /opt/app/imagini.js
ADD imagini/package.json /opt/app/package.json
ADD imagini/settings.json /opt/app/settings.json

WORKDIR /opt/app
RUN npm i

EXPOSE 3000

CMD [ "node", "/opt/app/imagini" ]
