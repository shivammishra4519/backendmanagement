const jwt = require('jsonwebtoken');
const { customerschema } = require('../model/customer-registration');
const { getDB } = require('../dbconnection');
require('dotenv').config();

const key = process.env.secretkey;

const customerRegister = async (req, res) => {
    try {
        const data = req.body;
        const validationResult = customerschema.validate(data);
        if (validationResult.error) {
            return res.status(400).json(validationResult.error);
        }

        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ message: 'Unauthorized: Authorization header missing' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: Token missing' });
        }

        jwt.verify(token, key, async (err, decodedToken) => {
            if (err) {
                return res.status(401).json({ message: 'Unauthorized: Invalid token' });
            }
            const db = getDB();
            const collection = db.collection('customers');
            data.currentCreadit = 0;
            data.active = true;
            data.shop = decodedToken.shop;
            const result = await collection.insertOne(data);
            return res.status(200).json({ message: 'Customer registered successfully', result });
        });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};



const customerList = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ message: 'Unauthorized: Authorization header missing' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: Token missing' });
        }

        jwt.verify(token, key, async (err, decodedToken) => {
            if (err) {
                return res.status(401).json({ message: 'Unauthorized: Invalid token' });
            }
            const db = getDB();
            const collection = db.collection('customers');

            const result = await collection.find({}, { projection: { _id: 0, firstName: 1, lastName: 1, adharCardNumber: 1, number: 1 } }).toArray()
            res.status(200).json(result);

        });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

const viewAllData = async (req, res) => {
    try {
        const data = req.body;

        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ message: 'Unauthorized: Authorization header missing' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: Token missing' });
        }

        jwt.verify(token, key, async (err, decodedToken) => {
            if (err) {
                return res.status(401).json({ message: 'Unauthorized: Invalid token' });
            }
            try {
                const db = getDB();
                const collection = db.collection('customers');
                const resultCursor = await collection.findOne({ adharCardNumber: data.adharCardNumber });
                res.status(200).json(resultCursor);
            } catch (error) {
                console.error('Error:', error);
                return res.status(500).json({ message: 'Internal server error' });
            }
        });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = { customerRegister, customerList,viewAllData };



