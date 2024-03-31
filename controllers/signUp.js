export const handleSignUp = async (req, res, db) => {
  const { firstName, lastName, email, username, password } = req.body;
  await db
    .insert({
      firstName,
      lastName,
      email,
      username,
      password,
    })
    .into("users")
    .catch((err) => {
      res.status(400).json("Error inserting into users table");
    });
};
