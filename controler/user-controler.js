const { userModel } = require('../model/user-model');
const { getDB } = require('../dbconnection');
const { createWallet } = require('./wallet');
const { getCurrentDate } = require('./functions')
const jwt = require('jsonwebtoken');
require('dotenv').config();

const key = process.env.secretkey;
const tokenExpiry = '12h'; // Token expiry set to 12 hours
const registerUser = async (req, res) => {
    try {

        const data = req.body;
        const validationError = userModel.validate(data);
        if (validationError.error) {
            return res.status(400).json(validationError.error)
        }

        const db = getDB();
        const collection = db.collection('users');
        const result = await collection.findOne({
            $or: [
                { number: data.number },
                { email: data.email }
            ]
        });
        if (result) {
            return res.status(400).json({ message: 'user already exit' })
        }

        data.role = 'user';
        data.active = true;
        const walletId = await createWallet(data.number);
        data.walletId = walletId.insertedId;
        data.registerDate = getCurrentDate();
        const response = await collection.insertOne(data);
        res.status(200).json(response);



    } catch (error) {
        res.status(400).json(error)
    }
}


const getUser = async (req, res) => {
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
                return res.status(401).json({ error: 'Unauthorized: Invalid token' });
            }

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
            { role: 'user' },  // Filter to include only documents with role 'user'
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

const updateStatus = async (req, res) => {
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
                return res.status(401).json({ error: 'Unauthorized: Invalid token' });
            }
            const role = decodedToken.role;
            if (role !== 'admin') {
                return res.status(400).json({ error: 'unauthorized user' })
            }
            const db = getDB()
            const collection = db.collection('users')
            const data = req.body;
            if (!data) {
                return res.status(400).json({ message: 'Data not found' })
            }

            const isUpdated = await collection.updateOne(
                { "number": data.number }, // Filter criteria
                { $set: { "active": !data.active } } // Update operation, setting active to false
            );

            res.status(200).json({ message: 'updated' })
        });

    } catch (error) {
        res.status(400).json(error);
    }
}


const walletCheckUser = async (req, res) => {
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
                return res.status(401).json({ error: 'Unauthorized: Invalid token' });
            }
            const role = decodedToken.role;

            if (role !== 'admin') {
                return res.status(400).json({ message: 'Unauthorized: user' })
            }
            const data = req.body;
            const db = getDB();
            const collection = db.collection('wallets');

            const amount = await collection.findOne({ user_id: data.number });

            if (!amount) {
                return res.status(400).json({ message: 'user not exit' })
            }
            
            res.status(200).json(amount);
        });
    } catch (error) {
        res.status(400).json(error);
    }
}

const findShopByShopNameOrNumber = async (req, res) => {
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
                return res.status(401).json({ error: 'Unauthorized: Invalid token' });
            }
            const db = getDB();
            const collection = db.collection('users');
            const data = req.body;
            
            const result = await collection.findOne({ shop: data.shop },{projection: {
                number: 1, _id: 0
            }});
            
            if(result){
                return res.status(200).json(result)
            }
            res.status(400).json({message:'Shop not Found'})
        });
    } catch (error) {
        res.status(400).json(error);
    }
}
module.exports = { registerUser, getUser, getUserList, updateStatus, walletCheckUser ,findShopByShopNameOrNumber};