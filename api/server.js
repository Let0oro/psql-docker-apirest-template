const express = require("express");
const pool = require("./db");
const port = 3000;

const server = express();
server.use(express.json());

server.get("/", async (req, res) => {
    try {
        const data = await pool.query("SELECT * FROM schools");
        res.status(200).send(data.rows);
        // res.status(200).send({
        //     message: `YOUR KEYS WERE ${name}, ${location}`
        // })
      } catch (error) {
        console.error(error);
        res.sendStatus(500);
      }
//   res.sendStatus(200);
});

server.post("/", async (req, res) => {
  const { name, location } = req.body;
  try {
    await pool.query("INSERT INTO schools (name, adress) VALUES ($1, $2)", [
      name,
      location,
    ]);
    res.status(201).send({message: 'Succesfully added child'})
    // res.status(200).send({
    //     message: `YOUR KEYS WERE ${name}, ${location}`
    // })
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

server.post("/setup", async (req, res) => {
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

server.listen(port, () => {
  console.log(`Conexion succesfull with port ${port}`);
});
