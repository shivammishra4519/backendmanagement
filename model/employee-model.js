;const joi=require('joi');

const employeeRegisterModel=joi.object({
    name:joi.string().required(),
    number:joi.number().required(),
    email:joi.string().required(),
    pin:joi.number().required(),
    password:joi.string().required(),
    confirmPassword:joi.string().required()
})


module.exports={employeeRegisterModel}