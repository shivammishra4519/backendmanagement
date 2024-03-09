const joi = require("joi");

const customerschema = joi.object({
    firstName: joi.string().required(),
    lastName: joi.string().required(),
    number: joi.string().required(),
    email: joi.string().required(),
    panCardNumber: joi.string().required(),
    adharCardNumber: joi.string().required(),
    gender: joi.string().required(),
    state: joi.string().required(),
    district: joi.string().required(),
    images:joi.required(),
    dob:joi.date().required(),
});

module.exports = { customerschema }; // Corrected export statement
