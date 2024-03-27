const { getDB } = require('../dbconnection');
const { getCurrentDate, getCurrentTime } = require('./functions')
const jwt = require('jsonwebtoken');
require('dotenv').config();

const key = process.env.secretkey;
const tokenExpiry = '12h';
const saveSms = async (req, res) => {
    try {
        const data = req.body;
        const date = getCurrentDate();
        const time = getCurrentTime();
        data.date = date;
        data.time = time;
        const db = getDB();
        const collection = db.collection('sendedsms');
        const result = await collection.insertOne(data);
        if (!result) {
            return res.status(400).json({ message: 'somtheing went wrong' })
        }
        res.status(200).json(result)
    } catch (err) {
        return res.status(500).json({ 'message': 'Internal server error' });
    }
}


const getAllSms = async (req, res) => {
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

            try {
                const db = getDB();
                const collection = db.collection('sendedsms');
                const result = await collection.find({}).toArray();

                if (!result || result.length === 0) {
                    return res.status(400).json({ message: 'No SMS found' });
                }

                return res.status(200).json(result);
            } catch (error) {
                return res.status(500).json({ message: 'Error retrieving SMS', error: error.message });
            }
        });

    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

module.exports={saveSms,getAllSms}