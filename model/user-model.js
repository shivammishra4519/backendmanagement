const joi=require('joi');

const userModel=joi.object({
    firstName:joi.string().required(),
    lastName:joi.string().required(),
    email:joi.string().required(),
    number:joi.string().required(),
    shopName:joi.string().required(),
    password:joi.string().required(),
    confirmPassword:joi.string().required(),
})

module.exports={userModel};