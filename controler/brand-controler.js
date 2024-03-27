const { getDB } = require('../dbconnection');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const key = process.env.secretkey;
const tokenExpiry = '12h';


const addAbrand = async (req, res) => {
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
            if (role == 'admin') {
                const data = req.body;
                const db = getDB();
                const collection = db.collection('information');
                const query = { brand: { $exists: true } };
                
                // Check if array exists
                const existingDocument = await collection.findOne(query);
                if (existingDocument) {
                    // If array exists, push the new brand into it
                    await collection.updateOne(query, { $push: { brand: data.brand } });
                    return res.status(200).json({ message: 'Brand added to existing array' });
                } else {
                    // If array doesn't exist, create a new document with the brand as an array
                    const result = await collection.insertOne({ brand: [data.brand] });
                    return res.status(200).json({ message: 'New document created with brand array' });
                }
            }
        });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};


const viewBrand = async (req, res) => {
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
          
                const data = req.body;
                const db = getDB();
                const collection = db.collection('information');
                const query = { brand: { $exists: true } };
                
                // Check if array exists
                const existingDocument = await collection.findOne(query);
                if(!existingDocument){
                    return res.status(400).json({message:'invalid request'})
                }
                res.status(200).json(existingDocument)
                
            
        });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports={addAbrand,viewBrand}
