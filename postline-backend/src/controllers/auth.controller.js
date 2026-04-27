const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  activatePlaceholderClient,
  createUser,
  findUserByEmail,
  findUserByPhone,
  findUserById,
  updateUser,
  updateUserPassword,
} = require("../repositories/users.repository");

const pickPublicUser = (user) => ({
  id: user.id,
  fullName: user.full_name,
  phone: user.phone,
  email: user.email,
  role: user.role,
  departmentId: user.department_id,
  createdAt: user.created_at,
});

const jwtSecret = process.env.JWT_SECRET || "dev_jwt_secret_change_me";

const signToken = (user) =>
  jwt.sign(
    { sub: user.id, role: user.role, email: user.email, departmentId: user.department_id },
    jwtSecret,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );

const register = async (req, res, next) => {
  try {
    const { fullName, phone, email, password } = req.body;

    const exists = await findUserByEmail(email);
    if (exists) {
      return res.status(409).json({ message: "Користувач з таким email вже існує" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const existingPhoneUser = await findUserByPhone(phone);
    if (existingPhoneUser) {
      if (existingPhoneUser.deleted_at) {
        return res.status(403).json({ message: "Акаунт з таким телефоном деактивовано" });
      }

      const canActivatePlaceholder =
        existingPhoneUser.role === "client"
        && !existingPhoneUser.password_hash
        && existingPhoneUser.email?.endsWith("@postline.local");

      if (!canActivatePlaceholder) {
        return res.status(409).json({ message: "Email або телефон вже використовується" });
      }

      const activated = await activatePlaceholderClient(existingPhoneUser.id, {
        fullName,
        email,
        passwordHash,
      });

      if (!activated) {
        return res.status(409).json({ message: "Email або телефон вже використовується" });
      }

      const token = signToken(activated);
      return res.status(201).json({ user: pickPublicUser(activated), token });
    }

    const user = await createUser({ fullName, phone, email, passwordHash });

    const token = signToken(user);
    return res.status(201).json({ user: pickPublicUser(user), token });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "Email або телефон вже використовується" });
    }
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ message: "Невірний email або пароль" });
    }

    if (user.deleted_at) {
      return res.status(403).json({ message: "Акаунт деактивовано" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Невірний email або пароль" });
    }

    const token = signToken(user);
    return res.status(200).json({ user: pickPublicUser(user), token });
  } catch (error) {
    return next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await findUserById(req.user.sub);
    if (!user) {
      return res.status(404).json({ message: "Користувача не знайдено" });
    }
    return res.status(200).json({ user: pickPublicUser(user) });
  } catch (error) {
    return next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { fullName, phone, email } = req.body;
    const user = await updateUser(req.user.sub, { fullName, phone, email });

    if (!user) {
      return res.status(404).json({ message: "Користувача не знайдено" });
    }

    return res.status(200).json({ user: pickPublicUser(user) });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "Email або телефон вже використовується" });
    }
    return next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await findUserById(req.user.sub);

    if (!user) {
      return res.status(404).json({ message: "Користувача не знайдено" });
    }

    const isCurrentPasswordCorrect = await bcrypt.compare(currentPassword, user.password_hash || "");
    if (!isCurrentPasswordCorrect) {
      return res.status(400).json({ message: "Поточний пароль вказано неправильно" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await updateUserPassword(user.id, passwordHash);

    return res.status(200).json({ message: "Пароль успішно оновлено" });
  } catch (error) {
    return next(error);
  }
};

module.exports = { register, login, getProfile, updateProfile, changePassword };
