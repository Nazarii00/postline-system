const bcrypt = require("bcryptjs");
const {
  createOperator,
  getUserById,
  getUserByEmail,
  getAllOperators,
  getOperatorsByDepartment,
  updateOperator,
  setOperatorStatus,
  deactivateOperator,
} = require("../repositories/operators.repository");

const isStaffAccount = (user) => ["operator", "courier"].includes(user.role);

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
    const includeInactive = req.user.role === "admin" && req.query.includeInactive !== "false";
    const operators = departmentId
      ? await getOperatorsByDepartment(departmentId, includeInactive)
      : await getAllOperators(includeInactive);
    return res.status(200).json({ data: operators });
  } catch (error) {
    return next(error);
  }
};

const updateOperatorHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { fullName, phone, departmentId, role } = req.body;

    const operator = await getUserById(id);
    if (!operator || !isStaffAccount(operator)) {
      return res.status(404).json({ message: "Оператора не знайдено" });
    }

    const updated = await updateOperator(id, { fullName, phone, departmentId, role });
    return res.status(200).json({ data: updated, message: "Оператора успішно оновлено" });
  } catch (error) {
    return next(error);
  }
};

const updateOperatorStatusHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const operator = await getUserById(id);
    if (!operator || !isStaffAccount(operator)) {
      return res.status(404).json({ message: "Оператора не знайдено" });
    }

    const updated = await setOperatorStatus(id, isActive);
    const message = isActive
      ? "Оператора успішно активовано"
      : "Оператора успішно деактивовано";

    return res.status(200).json({ data: updated, message });
  } catch (error) {
    return next(error);
  }
};

// М'яке видалення — deleted_at замість DELETE
const deactivateOperatorHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const operator = await getUserById(id);
    if (!operator || !isStaffAccount(operator)) {
      return res.status(404).json({ message: "Оператора не знайдено" });
    }

    const updated = await deactivateOperator(id);
    return res.status(200).json({ data: updated, message: "Оператора успішно деактивовано" });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createOperatorHandler,
  getOperatorHandler,
  listOperatorsHandler,
  updateOperatorHandler,
  updateOperatorStatusHandler,
  deactivateOperatorHandler,
};
