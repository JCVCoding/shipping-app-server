import express from "express";
import cors from "cors";
import knex from "knex";

import { handleSignUp } from "./controllers/signUp.js";
import { handleLogin } from "./controllers/login.js";

const db = knex({
  client: "pg",
  connection: process.env.POSTGRES_URL,
});

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.post("/signup", (req, res) => {
  handleSignUp(req, res, db);
});

app.post("/login", (req, res) => {
  handleLogin(req, res, db);
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
