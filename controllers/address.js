export const getAccountAddress = async (req, res, db) => {
  const { accountNumber } = req.params;

  const address = await db
    .select("street", "street_2", "city", "state", "zip")
    .from("addresses")
    .where("accountNumber", "=", accountNumber);

  if (address.length > 0) {
    res.status(200).send(address);
  } else {
    res
      .status(404)
      .send({ message: `Address for account: ${accountNumber} not found` });
  }
};
