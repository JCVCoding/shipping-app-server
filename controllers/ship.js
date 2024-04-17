export const handleShip = async (req, res, db) => {
  const { trackNumber, accountNumber, deliveryDate, shipDate, status } =
    req.body;
  try {
    const insertShipment = await db
      .insert({
        trackNumber,
        accountNumber,
        deliveryDate,
        shipDate,
        status,
      })
      .into("shipments");
    insertShipment.then(
      res.status(200).json({
        trackNumber,
        accountNumber,
        deliveryDate,
        shipDate,
        status,
      })
    );
  } catch (error) {
    res.status(400).json("Error inserting into shipments table");
  }
};
