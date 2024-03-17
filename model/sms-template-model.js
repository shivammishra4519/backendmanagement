const joi=require('joi');


const templateObj=joi.object({
    api:joi.string().required(),
    smsType:joi.string().required(),
    template:joi.string().required(),
    templateId:joi.string().required()
})


module.exports={templateObj}