const express = require("express");
const { register, login, getProfile, updateProfile } = require("../controllers/auth.controller");
const {
  registerValidation,
  loginValidation,
  updateProfileValidation,
} = require("../validators/auth.validators");
const { validate } = require("../middleware/validate.middleware");
const { authGuard } = require("../middleware/auth.middleware");

const authRouter = express.Router();

authRouter.post("/register", registerValidation, validate, register);
authRouter.post("/login", loginValidation, validate, login);
authRouter.get("/me", authGuard, getProfile);
authRouter.put("/me", authGuard, updateProfileValidation, validate, updateProfile);
authRouter.patch("/me", authGuard, updateProfileValidation, validate, updateProfile);

module.exports = { authRouter };
