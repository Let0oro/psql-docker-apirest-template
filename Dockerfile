# Simply create this file, compose.yaml file and a ReadMe with help from docker:
    # Run in CMD: 
        # (if your project still not have package-lock.json and package.json -> "npm init -y" or "npm init" and "npm install" )
        # 1. docker init 
        # 2. docker compose up --build (if it fails, revise that docker desktop is open)

FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY ./src ./src
COPY ./api ./api

RUN npm install

EXPOSE 3000
CMD ["npm", "run", "dev"]
