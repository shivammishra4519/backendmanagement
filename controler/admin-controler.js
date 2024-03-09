const { getDB } = require('../dbconnection');
const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');
require('dotenv').config();

const key = process.env.secretkey;
const tokenExpiry = '1h'; // Token expiry set to 1 hour

const adminlogin = async (req, res) => {
    try {
        const data = req.body;

        if (!data || !data.number || !data.password) {
            return res.status(400).json({ 'message': 'Bad request: userid and password required' });
        }

        const result = await findRole(data.number);

        if (!result) {
            return res.status(401).json({ 'message': 'Unauthorized: User not found' });
        }

        // Compare hashed password
        // const match = await bcrypt.compare(data.password, result.password);
        const match =(data.password) == (result.password)
        if (match) {
            if (result.active) {
                let tokenPayload = { number: result.number, role: result.role };
                if (result.shopName) {
                    tokenPayload.shop = result.shopName;
                }
                const token = jwt.sign(tokenPayload, key, { expiresIn: tokenExpiry });
                return res.status(200).json({ token });
            } else {
                res.status(400).json({ 'message': 'You are not active contact your admin' });
            }
        } else {
            return res.status(401).json({ 'message': 'Unauthorized: Password is incorrect' });
        }
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ 'message': 'Internal server error' });
    }
};

async function findRole(number) {
    try {
        const db = getDB();
        const collection = db.collection('users');
        const collection1 = db.collection('admin');
        const result1 = await collection.findOne({ number });
        const result2 = await collection1.findOne({ number });

        return result1 || result2;
    } catch (error) {
        throw error;
    }
}

module.exports = { adminlogin };
