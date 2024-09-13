FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY ./src ./src
COPY ./api ./api

RUN npm install

EXPOSE 3000
CMD ["npm", "run", "dev"]
