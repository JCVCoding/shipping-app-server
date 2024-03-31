import bcrypt from "bcryptjs";

export const handleSignUp = async (req, res, db) => {
  const { firstName, lastName, email, username, password } = req.body;
  const hash = bcrypt.hashSync(password);
  await db
    .insert({
      firstName,
      lastName,
      email,
      username,
      password: hash,
      joined: new Date(),
    })
    .into("users")
    .catch((err) => {
      res.status(400).json("Error inserting into users table");
    });
};
