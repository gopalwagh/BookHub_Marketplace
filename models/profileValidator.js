const { body } = require("express-validator");

exports.profileValidation = [
  body("phone")
    .isLength({ min: 10, max: 10 })
    .withMessage("Phone must be 10 digits"),

  body("pincode")
    .isLength({ min: 6, max: 6 })
    .withMessage("Pincode must be 6 digits"),

  body("address")
    .notEmpty()
    .withMessage("Address is required"),

  body("city")
    .notEmpty()
    .withMessage("City is required")
];