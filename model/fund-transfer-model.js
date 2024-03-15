const joi=require('joi');

const fundTransfer=joi.object({
    user_id:joi.string().required(),
    amount:joi.number().required(),
    pin:joi.string().required()
})


module.exports={fundTransfer}