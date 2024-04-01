const jwt = require('jsonwebtoken');
const { customerschema } = require('../model/customer-registration');
const { getDB } = require('../dbconnection');
const { createWallet } = require('../controler/wallet');
require('dotenv').config();

const key = process.env.secretkey;

const customerRegister = async (req, res) => {
    try {
        const data = req.body;
        const validationResult = customerschema.validate(data);
        if (validationResult.error) {
            return res.status(400).json({ error: validationResult.error.details.map(d => d.message) });
        }

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
            try {
                const db = getDB();
                const collection = db.collection('customers');

                const query = {
                    "$or": [
                        { "number": data.number },
                        { "email": data.email },
                        { "panCardNumber": data.panCardNumber },
                        { "adharCardNumber": data.adharCardNumber },
                    ]
                }

                const isUserExit = await collection.findOne(query);
                if(isUserExit){
                    return res.status(400).json({message:'Customer Alreday exit'});
                }

                data.active = true;
                if (!data.shop) {
                    data.shop = decodedToken.shop;
                }
                delete data.otp;
                delete data.adharOtp;
                const result = await collection.insertOne(data);
                return res.status(200).json({ message: 'Customer registered successfully' });
            } catch (error) {
                console.error('Error:', error);
                return res.status(500).json({ error: 'Internal server error' });
            }
        });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const customerList = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        console.log("before split", authHeader);
        if (!authHeader) {
            return res.status(401).json({ error: 'Unauthorized: Authorization header missing' });
        }

        // Extracting the token part after "Bearer "
        const token = authHeader.split(' ')[1];
        console.log("after split", token);
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: Token missing' });
        }

        jwt.verify(token, key, async (err, decodedToken) => {
            if (err) {
                return res.status(401).json({ error: 'Unauthorized: Invalid token' });
            }
            try {
                const db = getDB();
                const collection = db.collection('customers');
                const result = await collection.find().toArray();
                return res.status(200).json(result);
            } catch (error) {
                console.error('Error:', error);
                return res.status(500).json({ error: 'Internal server error' });
            }
        });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};


const viewAllData = async (req, res) => {
    try {
        const data = req.body;

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
            try {
                const db = getDB();
                const collection = db.collection('customers');
                const resultCursor = await collection.findOne({ adharCardNumber: data.adharCardNumber });
                return res.status(200).json(resultCursor);
            } catch (error) {
                console.error('Error:', error);
                return res.status(500).json({ error: 'Internal server error' });
            }
        });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { customerRegister, customerList, viewAllData };