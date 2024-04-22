const { getDB } = require('../dbconnection');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const key = process.env.secretkey;
const tokenExpiry = '12h';


const getUserBytoken = async (req, res) => {
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
            const number = decodedToken.number;
            const db = getDB();
            const collection = db.collection('users');
            const result = await collection.findOne({ "number": number }, { projection: { name: 1, email: 1, role: 1, active: 1, number: 1, _id: 0 } });
            if (!result) {
                return res.status(400).json({ message: 'user not exit' })
            }
            res.status(200).json(result);

        });
    } catch (error) {
        return res.status(500).json({ 'message': 'Internal server error' });
    }
}


const changePassWord = async (req, res) => {
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
            const number = decodedToken.number;
            const db = getDB();
            const collection = db.collection('users');

            // Find the user document
            const result = await collection.findOne({ "number": number });

            const data = req.body;
            if (!result) {
                return res.status(400).json({ message: 'User does not exist' });
            }

            // Check if the old password matches
            
            if (data.oldPassword !== result.password) {
                return res.status(400).json({ message: 'Incorrect old password' });
            }

            // Update the password
            const newPassword = data.newPassword;

            // Construct the object to be inserted into the history array
            const passwordChange = {
                password: newPassword,
                date: new Date() // Current date
            };

            // Check if the history array exists
            if (!result.passwordHistory) {
                // If the history array does not exist, create a new one
                result.passwordHistory = [passwordChange];
            } else {
                // If the history array exists, push the new object into it
                result.passwordHistory.push(passwordChange);
            }

            // Update the document with the new password and password history
            const updateResult = await collection.updateOne(
                { "number": number },
                { $set: { "password": newPassword, "passwordHistory": result.passwordHistory } }
            );

            if (updateResult.modifiedCount === 1) {
                // Password updated successfully
                return res.status(200).json({ message: 'Password updated successfully' });
            } else {
                // Handle the case where the password update failed
                return res.status(500).json({ message: 'Failed to update password' });
            }


        });
    } catch (error) {
        return res.status(500).json({ 'message': 'Internal server error' });
    }
}

module.exports = { getUserBytoken, changePassWord }