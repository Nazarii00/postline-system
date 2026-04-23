const express = require("express");
const { register, login, getProfile } = require("../controllers/auth.controller");
const { registerValidation, loginValidation } = require("../validators/auth.validators");
const { validate } = require("../middleware/validate.middleware");
const { authGuard } = require("../middleware/auth.middleware");

const authRouter = express.Router();

authRouter.post("/register", registerValidation, validate, register);
authRouter.post("/login", loginValidation, validate, login);
authRouter.get("/me", authGuard, getProfile);

module.exports = { authRouter };
