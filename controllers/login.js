import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createClient } from "redis";

const client = createClient({ url: "redis://redis:6379" });

client.on("error", (err) => console.log("Redis Client Error", err));

await client.connect();

const jwt_secret = "jwtshippingapp";
const jwt_expiration = "10 seconds";

// Create a session for the user
const createSession = async (user) => {
  const { userID } = user;
  console.log(userID);
  //   generate new access token
  let token = jwt.sign({ uid: userID }, jwt_secret, {
    expiresIn: jwt_expiration,
  });
  //   set token in redis
  await client.set(token, userID).catch(console.log);

  return token;
};

const getToken = async (req, res) => {
  const { authorization } = req.headers;
  console.log(authorization);
  await client.get(authorization, (err, reply) => {
    if (err || !reply) {
      return res.status(401).send("Unauthorized");
    }
  });
};

const handleLogin = async (req, res, db) => {
  const { username, password } = req.body;
  console.log(req.body);

  const userData = await db
    .select("username", "email", "password", "userID")
    .from("users")
    .where("username", "=", username)
    .orWhere("email", "=", username);

  if (userData.length) {
    const isValidPassword = bcrypt.compareSync(password, userData[0].password);
    if (isValidPassword) {
      return userData;
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
    ? getToken(req, res)
    : handleLogin(req, res, db)
        .then(async (data) => {
          let userData = data[0];
          if (userData) {
            const sessionToken = await createSession(userData);
            await res.json({ token: sessionToken });
          }
        })
        .catch(() => console.error);
};
