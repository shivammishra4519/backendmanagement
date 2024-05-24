const { getDB } = require('../dbconnection');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const key = process.env.secretkey;
const tokenExpiry = '12h';

const customerLogin = async (req, res) => {
    try {
        const db = getDB(); // Correct function call
        const collection = db.collection('customers');
        const data = req.body;
console.log(data)
        if (!data || !data.number || !data.password) {
            console.log("error1")
            return res.status(400).json({ message: 'Bad request: username or password missing' });
        }

        const user = await collection.findOne({ number: parseInt(data.number) });
        console
        if (!user) {
            console.log("error2")
            return res.status(400).json({ message: 'Customer does not exist' });
        }

        const adhar = user.adharCardNumber;
        const lastFiveDigits = adhar.substring(adhar.length - 5);
        
        if (data.password !== lastFiveDigits) {
            console.log("error3")
            return res.status(400).json({ message: 'Incorrect password' });
        }

        const payload = {
            number: user.number,
            role: user.role, // Assuming user has a role field
        };
        const token = jwt.sign(payload, key, { expiresIn: tokenExpiry });
        console.log("data",token)
        return res.status(200).json({ token }); // Return token as JSON object

    } catch (error) {
        console.error('Error during customer login:', error); // Log the error for debugging
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { customerLogin };
