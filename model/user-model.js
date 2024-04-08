const joi=require('joi');

const userModel=joi.object({
    name:joi.string().required(),
    email:joi.string().required(),
    number:joi.number().required(),
    shopName:joi.string().required(),
    pin:joi.string().required(),
    password:joi.string().required(),
    confirmPassword:joi.string().required(),
})

module.exports={userModel};