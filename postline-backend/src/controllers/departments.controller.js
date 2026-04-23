const {
  createDepartment,
  getDepartmentById,
  getAllDepartments,
  getDepartmentsByCity,
  updateDepartment,
  deleteDepartment,
} = require("../repositories/departments.repository");

const createDepartmentHandler = async (req, res, next) => {
  try {
    const { city, address, type, phone, openingTime, closingTime } = req.body;
    const department = await createDepartment({ city, address, type, phone, openingTime, closingTime });
    return res.status(201).json({ data: department, message: "Відділення успішно створено" });
  } catch (error) {
    return next(error);
  }
};

const getDepartmentHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const department = await getDepartmentById(id);
    if (!department) {
      return res.status(404).json({ message: "Відділення не знайдено" });
    }
    return res.status(200).json({ data: department });
  } catch (error) {
    return next(error);
  }
};

const listDepartmentsHandler = async (req, res, next) => {
  try {
    const { city } = req.query;
    const departments = city
      ? await getDepartmentsByCity(city)
      : await getAllDepartments();
    return res.status(200).json({ data: departments });
  } catch (error) {
    return next(error);
  }
};

const updateDepartmentHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { city, address, type, phone, openingTime, closingTime } = req.body;

    const existing = await getDepartmentById(id);
    if (!existing) {
      return res.status(404).json({ message: "Відділення не знайдено" });
    }

    const updated = await updateDepartment(id, { city, address, type, phone, openingTime, closingTime });
    return res.status(200).json({ data: updated, message: "Відділення успішно оновлено" });
  } catch (error) {
    return next(error);
  }
};

const deleteDepartmentHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await getDepartmentById(id);
    if (!existing) {
      return res.status(404).json({ message: "Відділення не знайдено" });
    }

    await deleteDepartment(id);
    return res.status(200).json({ message: "Відділення успішно видалено" });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createDepartmentHandler,
  getDepartmentHandler,
  listDepartmentsHandler,
  updateDepartmentHandler,
  deleteDepartmentHandler,
};