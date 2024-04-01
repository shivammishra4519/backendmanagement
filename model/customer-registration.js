const joi = require("joi");

const customerschema = joi.object({
    firstName: joi.string().required(),
    number: joi.number().required(),
    email: joi.string().required(),
    panCardNumber: joi.string().required(),
    adharCardNumber: joi.number().required(),
    gender: joi.string().required(),
    state: joi.string().required(),
    district: joi.string().required(),
    images:joi.required(),
    dob:joi.date().required(),
    address:joi.string().required(),
    otp:joi.any(),
    otpAdhar:joi.any(),
    shop:joi.any(),
});

module.exports = { customerschema }; // Corrected export statement
