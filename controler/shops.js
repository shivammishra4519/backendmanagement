const { getDB } = require('../dbconnection');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const key = process.env.secretkey;
const tokenExpiry = '12h'; // Token expiry set to 12 hours

const getShopName = async (req, res) => {
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
            const collection = db.collection('users');
           
            
            // Convert cursor to array
          const result=await  collection.find(
                { role: "user" },
                { projection: { shopName: 1, _id: 0 } }
            ).toArray();

            res.status(200).json(result);
        });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = { getShopName };
