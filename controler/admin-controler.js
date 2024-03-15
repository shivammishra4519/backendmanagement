const { getDB } = require('../dbconnection');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const key = process.env.secretkey;
const tokenExpiry = '12h'; // Token expiry set to 12 hours

const login = async (req, res) => {
    try {
        const data = req.body;

        if (!data || !data.number || !data.password) {
            return res.status(400).json({ 'message': 'Bad request: userid and password required' });
        }

        const number = parseInt(data.number); // Convert number to string if necessary

        const db = getDB();
        const collection = db.collection('users');
        const user = await collection.findOne({ number: number });

        if (!user) {
            return res.status(400).json({ 'message': 'Invalid mobile number' });
        }
        if (!(user.password === data.password)) {
            return res.status(400).json({ 'message': 'incorrect creadintails' })
        }
        const payload = {
            number: number,
            role: user.role,
        };

        if (user.shop) {
            payload.shop = user.shop;
        }

        const token = jwt.sign(payload, key, { expiresIn: tokenExpiry });
        res.status(200).json({token});
    } catch (error) {
        return res.status(500).json({ 'message': 'Internal server error' });
    }
};

module.exports = { login };
