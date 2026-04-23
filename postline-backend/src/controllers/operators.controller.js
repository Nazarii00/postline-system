const bcrypt = require("bcryptjs");
const {
  createOperator,
  getUserById,
  getUserByEmail,
  getAllOperators,
  getOperatorsByDepartment,
  updateOperator,
  deactivateOperator,
} = require("../repositories/operators.repository");

const createOperatorHandler = async (req, res, next) => {
  try {
    const { fullName, email, phone, departmentId, role, password } = req.body;

    const exists = await getUserByEmail(email);
    if (exists) {
      return res.status(409).json({ message: "Користувач з таким email вже існує" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const operator = await createOperator({
      fullName, email, phone, departmentId, role, passwordHash,
    });

    return res.status(201).json({ data: operator, message: "Оператора успішно створено" });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: "Email або телефон вже використовується" });
    }
    return next(error);
  }
};

const getOperatorHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const operator = await getUserById(id);
    if (!operator) {
      return res.status(404).json({ message: "Оператора не знайдено" });
    }
    return res.status(200).json({ data: operator });
  } catch (error) {
    return next(error);
  }
};

const listOperatorsHandler = async (req, res, next) => {
  try {
    const { departmentId } = req.query;
    const operators = departmentId
      ? await getOperatorsByDepartment(departmentId)
      : await getAllOperators();
    return res.status(200).json({ data: operators });
  } catch (error) {
    return next(error);
  }
};

const updateOperatorHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { fullName, phone, departmentId } = req.body;

    const operator = await getUserById(id);
    if (!operator) {
      return res.status(404).json({ message: "Оператора не знайдено" });
    }

    const updated = await updateOperator(id, { fullName, phone, departmentId });
    return res.status(200).json({ data: updated, message: "Оператора успішно оновлено" });
  } catch (error) {
    return next(error);
  }
};

// М'яке видалення — deleted_at замість DELETE
const deactivateOperatorHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const operator = await getUserById(id);
    if (!operator) {
      return res.status(404).json({ message: "Оператора не знайдено" });
    }

    await deactivateOperator(id);
    return res.status(200).json({ message: "Оператора успішно деактивовано" });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createOperatorHandler,
  getOperatorHandler,
  listOperatorsHandler,
  updateOperatorHandler,
  deactivateOperatorHandler,
};