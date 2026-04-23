const {
  createTariff,
  getTariffById,
  getAllTariffs,
  getTariffsByRoute,
  updateTariff,
  deleteTariff,
} = require("../repositories/tariffs.repository");

const createTariffHandler = async (req, res, next) => {
  try {
    const { cityFrom, cityTo, shipmentType, sizeCategory, basePrice, pricePerKg } = req.body;

    const tariff = await createTariff({
      cityFrom, cityTo, shipmentType, sizeCategory, basePrice, pricePerKg,
    });

    return res.status(201).json({ data: tariff, message: "Тариф успішно створено" });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: "Тариф для цього маршруту вже існує" });
    }
    return next(error);
  }
};

const getTariffHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tariff = await getTariffById(id);
    if (!tariff) {
      return res.status(404).json({ message: "Тариф не знайдено" });
    }
    return res.status(200).json({ data: tariff });
  } catch (error) {
    return next(error);
  }
};

const listTariffsHandler = async (req, res, next) => {
  try {
    const { cityFrom, cityTo } = req.query;
    const tariffs = (cityFrom && cityTo)
      ? await getTariffsByRoute(cityFrom, cityTo)
      : await getAllTariffs();
    return res.status(200).json({ data: tariffs });
  } catch (error) {
    return next(error);
  }
};

const updateTariffHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { basePrice, pricePerKg } = req.body;

    const tariff = await getTariffById(id);
    if (!tariff) {
      return res.status(404).json({ message: "Тариф не знайдено" });
    }

    const updated = await updateTariff(id, { basePrice, pricePerKg });
    return res.status(200).json({ data: updated, message: "Тариф успішно оновлено" });
  } catch (error) {
    return next(error);
  }
};

const deleteTariffHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tariff = await getTariffById(id);
    if (!tariff) {
      return res.status(404).json({ message: "Тариф не знайдено" });
    }

    await deleteTariff(id);
    return res.status(200).json({ message: "Тариф успішно видалено" });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createTariffHandler,
  getTariffHandler,
  listTariffsHandler,
  updateTariffHandler,
  deleteTariffHandler,
};