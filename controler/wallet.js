const { getDB } = require('../dbconnection')
const jwt = require('jsonwebtoken');
const key = process.env.secretkey;
async function createWallet(userId) {
    try {
        const db = getDB();
        const collection = db.collection('wallets');

        // Check if wallet with user ID already exists
        const existingWallet = await collection.findOne({ user_id: userId });
        if (existingWallet) {
            return 0
        }

        // Create new wallet object
        const newWallet = {
            user_id: userId,
            amount: 0, // Initial amount
            credit: 0  // Initial credit
        };

        // Insert new wallet document into collection
        const insertResult = await collection.insertOne(newWallet);

        // Return the newly created wallet document
        return insertResult;
    } catch (error) {
        console.error('Error creating wallet:', error.message);
        throw error; // Rethrow the error for the caller to handle
    }
}


const checkWalletAmount = async (req, res) => {
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
                const collection = db.collection('wallets');
                const user_id=decodedToken.number;
                const result=await collection.findOne({user_id:user_id});
                res.status(200).json(result);
            } catch (error) {
                console.error('Error:', error);
                return res.status(500).json({ error: 'Internal server error' });
            }
        });
    } catch (error) {
        console.error('Error creating wallet:', error.message);
        throw error; // Rethrow the error for the caller to handle
    }
}

const checkWalletAmountUsingNumber=async(req,res)=>{
    try{

    }catch (error) {
        console.error('Error creating wallet:', error.message);
        throw error; // Rethrow the error for the caller to handle
    }
}

module.exports = { createWallet,checkWalletAmount };