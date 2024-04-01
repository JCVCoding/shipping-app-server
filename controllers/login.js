import bcrypt from "bcryptjs";

export const handleLogin = async (req, res, db) => {
  const { username, password } = req.body;

  const userData = await db
    .select("username", "email", "password")
    .from("users")
    .where("username", "=", username)
    .orWhere("email", "=", username);

  if (userData.length) {
    const isValidPassword = bcrypt.compareSync(password, userData[0].password);
    if (isValidPassword) {
      res.status(200).send({ code: 0, message: `${username} logged in` });
    } else {
      res.status(401).send({ code: 2, message: "Password is incorrect" });
    }
  } else {
    res.status(401).send({ code: 1, message: "Username or email not found" });
  }
};
