const Joi = require("joi");

// ---- SIGNUP --- //
const signupValidation = Joi.object({
  name: Joi.string().trim().min(3).max(50).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(6).max(20).required(),
  role: Joi.string()
    .valid("admin", "ngo", "cleaning_company", "govt_officer", "user")
    .optional(),

});

// --- LOGIN --- //

const loginValidation = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// ---- NGO --- //

const ngoValidation = Joi.object({
  about: Joi.string().trim().min(2).max(100).required(),
  members: Joi.number().min(1).optional(),
  achievements: Joi.string().max(2000).optional(),
});

// -- CLEANING COM --- //

const cleaningCompanyValidation = Joi.object({
  about: Joi.string().trim().min(30).max(2000).required(),
  services: Joi.array().items(Joi.string()).optional(),
  experience: Joi.number().min(0).max(100).optional(),

});

// ---- UPDATE PROFILE ---- //

const updateProfileValidation = Joi.object({
  name: Joi.string().min(3).max(50).optional(),
  about: Joi.string().max(2000).optional(),

});

module.exports = {
  signupValidation,
  loginValidation,
  ngoValidation,
  cleaningCompanyValidation,
  updateProfileValidation,
};
