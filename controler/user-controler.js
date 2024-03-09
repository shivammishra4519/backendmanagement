const { userModel } = require('../model/user-model');
const { getDB } = require('../dbconnection')

const registerUser = async (req, res) => {
    try {
        const data = req.body;
        const validationError = userModel.validate(data);
        if (validationError.error) {
            res.status(400).json(validationError.error)
        }
        else {
            const db = getDB();
            const collection = db.collection('users');
            const result = await collection.findOne({ number: data.number });
            if (result){
                res.status(400).json({message:'user already exit'})
            }
            else{
                data.role='user';
                data.active=true;
                data.pendingAmount=0;
                const response=await collection.insertOne(data);
                res.status(200).json(response);
            }
        }

    } catch (error) {
        res.status(400).json(error)
    }
}
module.exports={registerUser};