import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const jwt_access_secret = process.env.ACCESS_TOKEN_SECRET;
const jwt_refresh_secret = process.env.REFRESH_TOKEN_SECRET;
const jwt_access_expiration = "10m";
const jwt_refresh_expiration = "1d";

// Create a session for the user
const createSession = async (user, res, client) => {
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

const authenticateToken = async (req, res, client) => {
  const { authorization } = req.headers;
  const response = await client.get(authorization);
  if (!response) {
    return res.status(401).send("Unauthorized. Invalid access token");
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

export const signInAuthentication = (req, res, db, client) => {
  // user sends the token if they have it
  const { authorization } = req.headers;
  //   if they send us a token we authenticate, otherwise we give them one if they send the correct credentials
  authorization
    ? authenticateToken(req, res, client)
    : handleLogin(req, res, db)
        .then(
          (data) => data.username
        ) /* Returns the username that we will use to sign the token with */
        .then((username) =>
          createSession(username, res, client).then((token) => {
            res.json({
              token: token,
              user: username,
            }); /* Sends the token and username to the client */
          })
        )
        .catch(() => console.error);
};
