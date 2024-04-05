import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createClient } from "redis";

const client = createClient({ url: "redis://redis:6379" });

client.on("error", (err) => console.log("Redis Client Error", err));

await client.connect();

const jwt_access_secret = process.env.ACCESS_TOKEN_SECRET;
const jwt_refresh_secret = process.env.REFRESH_TOKEN_SECRET;
const jwt_access_expiration = "10m";
const jwt_refresh_expiration = "1d";

// Create a session for the user
const createSession = async (user, res) => {
  //   generate new access token
  let accessToken = jwt.sign({ username: user }, jwt_access_secret, {
    expiresIn: jwt_access_expiration,
  });
  // generate new refresh token
  let refreshToken = jwt.sign({ username: user }, jwt_refresh_secret, {
    expiresIn: jwt_refresh_expiration,
  });
  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    sameSite: "None",
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
  });
  //   set access token in redis
  await client.set(accessToken, user).catch(console.log);

  return accessToken;
};

const authenticateToken = async (req, res) => {
  const { authorization } = req.headers;
  const response = await client.get(authorization);
  if (!response) {
    return res.status(401).send("Unauthorized");
  }
  return res.status(200).send("Authorized");
};

const handleLogin = async (req, res, db) => {
  const { username, password } = req.body;

  const userData = await db
    .select("username", "email", "password")
    .from("users")
    .where("username", "=", username)
    .orWhere("email", "=", username);

  if (userData.length) {
    const isValidPassword = bcrypt.compareSync(password, userData[0].password);
    if (isValidPassword) {
      return userData[0];
    } else {
      res.status(401).send({ code: 2, message: "Password is incorrect" });
    }
  } else {
    res.status(401).send({ code: 1, message: "Username or email not found" });
  }
};

export const signInAuthentication = (req, res, db) => {
  const { authorization } = req.headers;
  authorization
    ? authenticateToken(req, res)
    : handleLogin(req, res, db)
        .then((data) => data.username)
        .then((userData) =>
          createSession(userData, res).then((token) => {
            res.json({ token: token, user: userData });
          })
        )
        .catch(() => console.error);
};
