const { userModel } = require('../model/user-model');
const { getDB } = require('../dbconnection');
const { createWallet } = require('./wallet');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const key = process.env.secretkey;
const tokenExpiry = '12h'; // Token expiry set to 12 hours
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
            if (result) {
                res.status(400).json({ message: 'user already exit' })
            }
            else {
                data.role = 'user';
                data.active = true;
                const walletId = await createWallet(data.number);
                data.walletId = walletId.insertedId;
                const response = await collection.insertOne(data);
                res.status(200).json(response);
            }
        }

    } catch (error) {
        res.status(400).json(error)
    }
}


const getUser = async (req, res) => {
    try {


        const authHeader = req.headers['authorization'];
        console.log(authHeader)
        if (!authHeader) {
            return res.status(401).json({ error: 'Unauthorized: Authorization header missing' });
        }
        

        const token = authHeader.split(' ')[1];
        console.log(token)
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: Token missing' });
        }

        jwt.verify(token, key, async (err, decodedToken) => {
            if (err) {
                return res.status(401).json({ error: 'Unauthorized: Invalid token' });
            }
            console.log(2)
            const number = decodedToken.number;
            const db = getDB();
            const collection = db.collection('users');
            const result = await collection.find(
                {
                    role: { $ne: "admin" }, // Filter out documents where role is not "admin"
                    number: { $ne: number } // Exclude documents where the number matches the decoded token's number
                },
                {
                    name: 1,
                    number: 1,
                    _id: 0 // Projection to include only name and number fields, excluding _id
                }
            ).toArray();
            res.status(200).json(result);

        })
    } catch (error) {
        res.status(400).json(error)
    }
}

const getUserList = async (req, res) => {
    try {
        const db = getDB();
        const collection = db.collection('users');
        const userList = await collection.find(
            {},  // No specific filter applied in this example
            {
                name: 1,
                email: 1,
                active: 1,
                role: 1,
                number: 1,
                _id: 0
            }
        ).toArray();

        res.status(200).json(userList);

    } catch (error) {
        res.status(400).json(error);
    }
}
module.exports = { registerUser, getUser, getUserList };