const { getDB } = require('../dbconnection');
const jwt = require('jsonwebtoken');
const joi = require('joi')
require('dotenv').config();

const key = process.env.secretkey;
const tokenExpiry = '12h';



const registerGuarantor = async (req, res) => {
    try {
        const data = req.body;
        const validationError = guarantorSchema.validate(data);
        if (validationError.error) {
            return res.status(400).json(validationError.error);
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
                return res.status(400).json({ error: 'Unauthorized: Invalid token' });
            }

            const db = getDB();
            const collection = db.collection('guarantor');


            if (!data) {
                return res.status(400).josn({ error: 'bad request' });
            }
            const isAlreadyPresent = await collection.findOne({ number: data.number });
            if (isAlreadyPresent) {
                return res.status(400).json({ error: 'Guarantor is already exit' })
            }

            const insertId = await collection.insertOne(data);
            if (!insertId) {
                return res.status(400).json({ error: 'somtheing went wrong' })
            }
            return res.status(200).json({ message: 'successfully' });

        });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}


const guarantorSchema = joi.object({
    name: joi.string().required(),
    number: joi.number().required(),
    adharNumber: joi.number().required(),
    address: joi.string().required(),
});


module.exports = { registerGuarantor }