import express from "express";
import cors from "cors";
import knex from "knex";
import "dotenv/config";

import { handleSignUp } from "./controllers/signUp.js";
import { signInAuthentication } from "./controllers/login.js";
import { handleLogout } from "./controllers/logout.js";

import { createClient } from "redis";

const client = createClient({ url: "redis://redis:6379" });

client.on("error", (err) => console.log("Redis Client Error", err));

await client.connect();

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
  signInAuthentication(req, res, db, client);
});

app.post("/logout", (req, res) => {
  handleLogout(req, res, client);
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
