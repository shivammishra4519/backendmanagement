const { getDB } = require('../dbconnection');
const { getCurrentDate, getCurrentTime } = require('./functions')
const jwt = require('jsonwebtoken');
require('dotenv').config();
const key = process.env.secretkey;
const tokenExpiry = '12h'; //

const findDailyCollection = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];

        if (!authHeader) {
            return res.status(401).json({ error: 'Unauthorized: Authorization header missing' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: Token missing' });
        }

        jwt.verify(token, key, async (err, decodedToken) => {
            if (err) {
                return res.status(400).json({ error: 'Unauthorized: Invalid token' });
            }

            const db = getDB();
            const collection = db.collection('dailyCollection');
            const data = req.body;
            let number
            if (data.number) {
                number = data.number
            } else {
                number = decodedToken.number;
            }



            const find = await collection.findOne({ user_id: number });

            if (find) {
                return res.status(200).json(find);
            } else {
                return res.status(404).json({ message: 'User not found' });
            }
        });
    } catch (error) {
        console.error('Internal server error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}



const findAllDailyCollection = async (req, res) => {
    try {


        const authHeader = req.headers['authorization'];

        if (!authHeader) {
            return res.status(401).json({ error: 'Unauthorized: Authorization header missing' });

        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: Token missing' });
        }

        jwt.verify(token, key, async (err, decodedToken) => {
            if (err) {
                return res.status(400).json({ error: 'Unauthorized: Invalid token' });
            }
            const db = getDB();
            const collection = db.collection('dailyCollection');
            const role = decodedToken.role;
            if (role !== 'admin') {
                return res.status(400).json({ message: 'Unauthorized: user' })
            }
            const find = await collection.find().toArray();

            if (find) {
                const totalAmount = find.reduce((sum, wallet) => sum + wallet.amount, 0);
                return res.status(200).json({ totalAmount });
            }
            res.status(400).json({ message: 'Inavlid request' })

        });
    } catch (error) {

        return res.status(500).json({ 'message': 'Internal server error' });
    }
}


const settleDailyAmount = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];

        if (!authHeader) {
            return res.status(401).json({ error: 'Unauthorized: Authorization header missing' });

        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: Token missing' });
        }

        jwt.verify(token, key, async (err, decodedToken) => {
            if (err) {
                return res.status(400).json({ error: 'Unauthorized: Invalid token' });
            }
            const role = decodedToken.role;
            if (role !== 'admin') {
                return res.status(400).json({ message: 'unauthorized request' })
            }
            const db = getDB();
            const number = decodedToken.number;
            
            const findAdmin = await db.collection('users').findOne({ number: number }, { projection: { pin: 1, _id: 0 } })
           
            if (!findAdmin) {
                return res.status(400).json({ message: 'User not exit ' })
            }
            const data = req.body;

            const isValidEmploye = await db.collection('users').findOne({ number: parseInt(data.user_id) }, { projection: { number: 1, _id: 0 } })
        
            if (!isValidEmploye) {
                return res.status(400).json({ message: 'Employee not Exit' })
            }
            const checkPendingAmount = await db.collection('dailyCollection').findOne({ user_id: parseInt(data.user_id) });
            if (!checkPendingAmount) {
                return res.status(400).json({ message: 'pending amount not found' });
            }

            const isPinMatched = (findAdmin.pin) == (data.pin);
            if (!isPinMatched) {
                return res.status(400).json({ message: 'Incorrect pin' })
            }
            const update = await db.collection('dailyCollection').updateOne({ user_id:  parseInt(data.user_id) },
                { $inc: { amount: -data.amount } })

            if (!update) {
                return res.status(400).json({ message: 'amount can not be setlled' })
            }
            const checkPendingAmountAfter = await db.collection('dailyCollection').findOne({ user_id:  parseInt(data.user_id)});
            data.time = getCurrentTime();
            data.date = getCurrentDate();
            delete data.pin;
            data.openigAmount=checkPendingAmount.amount;
            data.closeingAmount=checkPendingAmountAfter.amount;

            const insertRecord=await db.collection('collectioSettle').insertOne(data);
            if(!insertRecord){
                return res.status(400).json({message:'Record not created'})
            }

             res.status(200).json({message:'Collection settled'})



        });
    } catch (error) {
        return res.status(500).json({ 'message': 'Internal server error' });
    }
}
module.exports = { findDailyCollection, findAllDailyCollection ,settleDailyAmount}