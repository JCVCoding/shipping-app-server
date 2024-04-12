export const getAccount = async (req, res, db) => {
  const { username } = req.params;
  const accountNumber = await db
    .select("accountNumber")
    .from("account")
    .where("username", "=", username);

  if (accountNumber.length > 0) {
    res.status(200).send(accountNumber);
  } else {
    res.status(404).send({ message: "Account not found" });
  }
};
