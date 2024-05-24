const Joi=require('joi');

const deviceDetails=Joi.object({
    brand: Joi.string().required(),
    model: Joi.string().required(),
    dpPrice: Joi.number().required(),
    margin: Joi.number().required(),
    interest: Joi.number().required(),
    fileCharge: Joi.number().required(),
    downPayment: Joi.number().required(),
})


sellDeviceDetails=Joi.object({
    brandName: Joi.string().required(),
    modelName: Joi.string().required(),
    imei1: Joi.string().required(),
    imei2: Joi.string().required(),
    mrp: Joi.number().required(),
    fileCharge: Joi.number().required(),
    totalAmount: Joi.number().required(),
    discount: Joi.any(),
    downPayment: Joi.number().required(),
    financeAmount: Joi.number().required(),
    emi: Joi.number().required(),
    emiAmount: Joi.number().required(),
    customerNumber:Joi.number().required(),
    interest:Joi.number().required(),
    customerName:Joi.string().required(),
    gaurantorNumber:Joi.number().required(),
    loanKey:Joi.string().required(),
})

module.exports={deviceDetails,sellDeviceDetails}