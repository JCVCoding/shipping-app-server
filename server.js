import express from "express";
import cors from "cors";
import knex from "knex";

const db = knex({
  client: "pg",
  connection: process.env.POSTGRES_URL,
});

const app = express();
const port = 3000;

app.use(cors());
app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
