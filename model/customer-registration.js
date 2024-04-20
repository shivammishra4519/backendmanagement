const joi = require("joi");

const customerschema = joi.object({
    firstName: joi.string().required(),
    number: joi.number().required(),
    email: joi.string().required(),
    adharCardNumber: joi.number().required(),
    gender: joi.string().required(),
    state: joi.string().required(),
    district: joi.string().required(),
    images:joi.required(),
    dob:joi.date().required(),
    address:joi.string().required(),
    secondId:joi.string().required(),
    fatherName:joi.string().required(),
    secondIdType:joi.string().required(),
    otp:joi.any(),
    otpAdhar:joi.any(),
    shop:joi.string().required(),
});

module.exports = { customerschema }; // Corrected export statement
