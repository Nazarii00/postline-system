const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET || "dev_jwt_secret_change_me";

const authGuard = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Відсутній токен авторизації" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "JWT токен невалідний або протермінований" });
  }
};

module.exports = { authGuard };
