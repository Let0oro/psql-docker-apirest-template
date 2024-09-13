# psql-docker-apirest-template

A psql js express rest API connected with Docker by dockerfiles, with an explanation of the steps to do. Thanks to [smoljames youtuber](https://youtu.be/sDPw2Yp4JwE?si=Gu08vK3IkVQvUvDw).

If you want, this is the official [tutorial for nodeJS](https://docs.docker.com/guides/language/nodejs/containerize/)

# Table of contents
--- 
1. [API postgres configuration](#start-your-api)
2. [Docker configuration](#start-your-docker-configuration)
--- 

## Start your API

### Intall packages

To get start, you must install this packages: 

```shell
npm install express pg
```

### Add running script to your package.json

In your package.json file, you can add the script: 

```json
"dev": "node ./api/server.js"
```
Now, yout file should be similar to this: 

```json
{
  "name": "psql-express-api-smoljames",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "node ./api/server.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "description": "",
  "dependencies": {
    "express": "^4.19.2",
    "pg": "^8.12.0",
    "pq": "^0.0.3"
  },
  "devDependencies": {
    "@types/node": "^20.14.10"
  }
}

```

### Create an api folder at the root of your project

Then, into this api folder, you shoud create a db.js file, a server.js file and a test.rest* file to manage the fetch calls, adn this apeareance should be like this:

```shell
├── api  ---------> mkdir api
│ ├── db.js  -----> code db.js
│ ├── server.js  -> code server.js
│ └── test.rest  -> code test.rest
```

*Note: for the correct use of .rest files from VSCode, you shoud install the extension named "REST Client" (with lightblue icon).


### Create the db.js

Into your db.js file, copy this code, later we exposed you this parts: 

```js
const { Pool } = require("pg");

const { database } = require("pg/lib/defaults");

const pool = new Pool({
  host: "db",
  port: 3000,
  user: "user123",
  password: "password123",
  database: "db123",
});

module.exports = pool;
```

The ```const { Pool } = require("pg");``` line connect with the pg library, which manage the postgres languaje in JS and allow to create a new postgres connection.


```js
const pool = new Pool({
  host: "hostNameExample",
  port: arbitraryNumberOfYourPort,
  user: "userNameExample",
  password: "passwordExample",
  database: "databaseNameExample",
});
```
This is the basic configuration of our Pool (always with the same values than our compose.yaml file) 

The ```module.exports = pool;``` line allows to import this variable in other files

### Create the server.js for manage your  postgres database

Into your server.js file, copy this code: 

```js
const express = require("express");
const pool = require("./db"); //! Importing the pool variable with its information.
const port = 3000; // Selecting a port

// Configuration for express
const server = express();
server.use(express.json());
server.use(express.urlencoded({extended: false}));

server.get("/", async (req, res) => { //! GET
    try {
        const data = await pool.query("SELECT * FROM schools"); // Manage the calls by type PostgresSQL querys (at pool connection, .query for use the query method and the string with the specified query) 
        res.status(200).send(data.rows);
      } catch (error) {
        console.error(error);
        res.sendStatus(500);
      }
});

server.post("/", async (req, res) => { //! POST
  const { name, location } = req.body;
  try {
    await pool.query("INSERT INTO schools (name, adress) VALUES ($1, $2)", [
      name,
      location,
    ]); // string variables are allowed while their are placed in the second argument array, also you can use template strings
    res.status(201).send({message: 'Succesfully added child'})
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

server.post("/setup", async (req, res) => { //!POST to create the table, this must be our first call, like the creation of a table in mongoDB but through command lines
  try {
    await pool.query(
      "CREATE TABLE schools( id SERIAL PRIMARY KEY, name VARCHAR(100), adress VARCHAR(100) )"
    );
    res.status(201).send({message: 'Succesfully created table'})

  } catch (error) {
    console.error(error);
    res.status(500);
  }
});

server.listen(port, () => { // Establish connection with the port
  console.log(`Conexion succesfull with port ${port}`);
});
```

### Create the test.rest file to test and interact with your postgres database

Into your test.rest file, copy this code (this is an basic example of fetchs, you can use your owns):

```shell


### SETUP
POST http://localhost:3000/setup

### GET ALL
GET http://localhost:3000/

### POST
POST http://localhost:3000/
Content-Type: application/json

{
    "name": "David",
    "location": "10 hello world street"
}
```

## Start your Docker configuration

### From zero

Run in CMD:

1. ```npm init -y```
2. ```npm i```

### With package.json and package-lock.json

Open [Docker Desktop](https://docs.docker.com/desktop/)

Run in CMD

1. ```docker init```

1.2. Follow the steps in terminal, choose a file to run the project (for example: index.js, later you could change in the Dockerfile file, this result in the command ```node index.js```) and a port (for example: 3000)

You should now have at least the following contents in your directory.
```shell
├── name-of-your-directory
│ ├── .dockerignore
│ ├── .gitignore
│ ├── compose.yaml
│ ├── Dockerfile
│ ├── package-lock.json
│ ├── package.json
│ └── README.md
```

2. Manage your Dockerfile to obtain the image you want (f.e.: postgres):

- Open your compose.yaml file and replace all the code on this file for this other:

```yaml

version: "3"
services: 
  db: 
    image: postgres
    environment:
      POSTGRES_PASSWORD: password123
      POSTGRES_USER: user123
      POSTGRES_DB: db123
  app:
    image: my-server
    ports: 
      - 13000:3000
```
- Open the Dockerfile and replace the code here for this other: 

```Dockerfile
ARG NODE_VERSION=20.12.2
# Change this version with the version in the original Dockerfile file


FROM node:${NODE_VERSION}-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY ./src ./src
COPY ./api ./api

RUN npm install

EXPOSE 3000
CMD ["npm", "run", "dev"]

```
Note: Warning about the .gitignore files, you can only use node_modules (also in .dockerignore file)

3. ```docker build -t my-server .``` to create the image in docker desktop

4. ```docker compose up --build``` (if it fails, revise that docker desktop is open)

* In addition, you can use this command to run the containers in docker when they are stopped ```docker-compose up```
   If error code 127: >npm, not found ->
   a. Revise your code at file Dockfile (a common error for example: not single quotes, double quotes)
   b. RUN "docker system prune" and repeat

Finished? Revise your docker desktop and you should see a new container with the name of the project

---
