export const handleLogout = async (req, res, client) => {
  const { token } = req.body;
  const key = await client.get(token).catch((err) => console.error(err));
  if (key) {
    await client.DEL(key);
  }
  res.sendStatus(200);
};
