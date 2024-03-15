const { getDB } = require('../dbconnection');
const { employeeRegisterModel } = require('../model/employee-model')



const employeeRegister = async (req, res) => {
    try {
        const data = req.body;
        const validationError = employeeRegisterModel.validate(data);
        if (validationError.error) {
            return res.status(400).json(validationError.error)
        }
        const db = getDB();
        const collection = db.collection('users');
        const find = await collection.findOne({ number: data.number });
        console.log(find)
        if (find) {
            return res.status(400).json({ 'message': 'user all ready exit' });
        }
        delete data.confirmPassword;
        data.active = true;
        data.role = 'employee';


        const collectionWallet = db.collection('wallets');
        const existingWallet = await collection.findOne({ user_id: data.number });
        if (existingWallet) {
            return res.status(400).json({ 'message': 'somtheing went wrong' })
        }

        const newWallet = {
            user_id: data.number,
            amount: 0,
            credit: 0
        };
        const insertResult = await collectionWallet.insertOne(newWallet);
        data.walletId = insertResult.insertedId;
        const response = await collection.insertOne(data);
        res.status(200).json(response);


    } catch (error) {
        return res.status(500).json({ 'message': 'Internal server error' });
    }
}

module.exports = { employeeRegister }