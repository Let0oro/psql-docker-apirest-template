# psql-docker-apirest-template

A psql js express rest API connected with Docker by dockerfiles, with an explanation of the steps to do. Thanks to [smoljames youtuber](https://youtu.be/sDPw2Yp4JwE?si=Gu08vK3IkVQvUvDw).

Another welcome [tutorial](https://medium.com/@antonio.maccarini/dockerize-a-react-application-with-node-js-postgres-and-nginx-124c204029d4)

If you want, this is the official [tutorial for nodeJS](https://docs.docker.com/guides/language/nodejs/containerize/)

# Table of contents
--- 
1. [API postgres configuration](#start-your-api)
2. [Docker configuration](#start-your-docker-configuration)
--- 

## Start your API

### Intall packages

To get started, you must run this command to create the package.json...: 

```shell
npm init -y
```

And install these packages:
```shell
npm install express pg nodemon
```

### Add running script to your package.json

In your package.json file, you can add the script: 

```json
"main": "./api/server.js"
/.../
"server": "nodemon .",
```

An important detail is to add the ```type: module``` at least: 
```json
"type": "module"
```

We also left you another scripts to help you with the docker management: 
```json
"docker:compose-built": "docker-compose up --build",
"docker:compose-run": "docker-compose up",
"docker:build-img": "docker build -t my-server .",
"docker:restart": "docker system prune && docker build -t my-server . && docker-compose up --build"
```

Now, your file should be similar to this: 

```json
{
  "name": "space-pixels-api",
  "version": "1.0.0",
  "description": "",
  "main": "./api/server.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "server": "nodemon .",
    "docker:compose-built": "docker-compose up --build",
    "docker:compose-run": "docker-compose up",
    "docker:build-img": "docker build -t my-server .",
    "docker:restart": "docker system prune && docker build -t my-server . && docker-compose up --build"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "express": "^4.21.0",
    "nodemon": "^3.1.4",
    "pg": "^8.12.0"
  },
  "type": "module"
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
import pg from 'pg';

const { Client } = pg;

const client = new Client({
  user: 'user',
  host: 'db',
  database: 'db123',
  password: 'pass',
  port: 5432,
});
client.connect();

const createTable = async () => { 
  await client.query(`CREATE TABLE IF NOT EXISTS users 
  (id serial PRIMARY KEY, name VARCHAR (255) UNIQUE NOT NULL, 
  email VARCHAR (255) UNIQUE NOT NULL, age INT NOT NULL);`)
};

createTable();

export default client;
```

The ```import pg from 'pg';``` line connect with the pg library, which manage the postgres languaje in JS and allow to create a new postgres connection.


```js
const { Client } = pg;

const client = new Client({
  user: 'user',
  host: 'db',
  database: 'db123',
  password: 'pass',
  port: 5432,
});
client.connect();
```
This is the basic configuration of our Client (always with the same values than our compose.yaml file).

```js
const createTable = async () => { 
  await client.query(`CREATE TABLE IF NOT EXISTS users 
  (id serial PRIMARY KEY, name VARCHAR (255) UNIQUE NOT NULL, 
  email VARCHAR (255) UNIQUE NOT NULL, age INT NOT NULL);`)
};

createTable();
```
This is for create a table in our DB when it doesn't exist.

The ```export default client;``` line allows to import this variable in other files.

### Create the server.js for manage your  postgres database

Into your server.js file, copy this code: 

```js
import express from "express";
import client from "./db.js"; //! Importing the client variable with its connection to DB.

const port = 3000; // Selecting a port

// Configuration for express
const server = express();
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.get("/api", (req, res) => { //! Test the connection
  try {
    res.send("Hello World!");
  } catch (err) {
    console.error({ err });
  }
});

server.get("/api/all", async (req, res) => { // GET all users
  try {
    const response = await client.query(`SELECT * FROM users`);

    if (response) {
      res.status(200).send(response.rows);
    }
  } catch (error) {
    res.status(500).send("Error");
    console.log(error);
  }
});

server.post("/api/form", async (req, res) => { //! POST an user
  try {
    const name = req.body.name;
    const email = req.body.email;
    const age = req.body.age;

    const response = await client.query(
      `INSERT INTO users(name, email, age) VALUES ('${name}', '${email}', ${age});`
    );
    if (response) {
      res.status(200).send(req.body);
    }
  } catch (error) {
    res.status(500).send("Error");
    console.log(error);
  }
});

// Establish connection with the port
server.listen(port, () => console.log(`Server running on port ${port}`)); 
```

### Create the test.rest file to test and interact with your postgres database

Into your test.rest file, copy this code (this is an basic example of fetchs, you can use your owns):

```shell
### GET CONNECTION
GET http://localhost:3000/api

### GET ALL
GET http://localhost:3000/api/all

### POST
POST http://localhost:3000/api/form
Content-Type: application/json

{
    "name": "foo",
    "email": "foo@email.mail",
    "age": "30"
}
```

## Start your Docker configuration

Open [Docker Desktop](https://docs.docker.com/desktop/)

Run in CMD

1. ```docker init```

1.2. Follow the steps in terminal, choose a file to run the project (for example: index.js, later you could change in the Dockerfile file, this result in the command ```node index.js```) and a port (for example: 3000)

You should now have at least the following contents in your directory.
```shell
├── name-of-your-directory
│ └── api/
│   ├── server.js
│   ├── db.js
│ │ └── test.rest
│ ├── .dockerignore
│ ├── .gitignore
│ ├── compose.yaml
│ ├── Dockerfile
│ ├── package-lock.json
│ ├── package.json
│ └── README.md
```

2. Manage your Dockerfile and compose.yaml to obtain the image you want (f.e.: postgres):

- Open your compose.yaml file and replace all the code on this file for this other:

```yaml
version: "3"
services: 
  db:
    image: postgres
    container_name: db
    restart: always
    tty: true
    environment: 
      - POSTGRES_PASSWORD=pass
      - POSTGRES_USER=user
      - POSTGRES_DB=db123
    ports: 
      - "5432:5432"
  server:
    image: my-server
    container_name: server
    working_dir: /usr/src/app
    tty: true
    ports: 
      - "3000:3000"
    command: npm run server
    depends_on:
       - db
```
- Open the Dockerfile and replace the code here for this other: 

```Dockerfile
ARG NODE_VERSION=20.12.2
# Change this version with the version in the original Dockerfile file


FROM node:${NODE_VERSION}-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000
CMD ["npm", "run", "server"]

```
Note: Warning about the .gitignore files, you can only use node_modules (also in .dockerignore file)

3. ```docker build -t my-server .``` or ```docker:build-img``` (On case you are copied the scripts we make for you) to create the image in Docker desktop

4. ```docker compose up --build``` or ```docker:compose-built``` (On case you are copied the scripts we make for you). If it fails, revise the Docker desktop is open.

* In addition, you can use this command to run the containers in Docker when they are stopped ```docker-compose up```
   If error code 127: >npm, not found ->
   a. Revise your code at file Dockfile (a common error for example: not single quotes, double quotes)
   b. RUN "docker system prune" and repeat

Finished? Revise your Docker desktop and you should see a new container with the project's name and start filling your DB with interesting info.

---
