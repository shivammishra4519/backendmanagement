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
                return res.status(200).json({ isAlreadyPresent })
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

const checkGurantor = async (req, res) => {
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
            const data = req.body;

            const db = getDB();
            const collection = db.collection('guarantor');

            const result = await collection.findOne({
                $or: [
                    { number: data.number },
                    { aadharNumber: data.aadharNumber }
                ]
            });



            if (result) {
                return res.status(200).json({ status: 1, message: 'user already exit' })
            }
            return res.status(200).json({ status: 0, message: 'user  not exit' })

        });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

const viewGuarantorList = async (req, res) => {
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
            const collection = db.collection('guarantor');
            const result = await collection.find().toArray();
            if (result) {
                return res.status(200).json(result);
            }
            res.status(400).json({ error: 'Data not found' });
        });

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}


const viewGaurantorByNumber = async (req, res) => {
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
            const number = req.body.number;

            const collection = db.collection('guarantor');
            const result = await collection.findOne({ number: parseInt(number) });
            if (!result) {
                return res.status(400).json({ message: 'guarantor is not exit' });
            }
            res.status(200).json(result)
        });

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}


const verifyGaurantor = async (req, res) => {
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
            const number = req.body.number;

            const collection = db.collection('guarantor');
            const checkNumberIncustomer = await db.collection('customers').findOne({ number: parseInt(number) });
            if (checkNumberIncustomer) {
                return res.status(400).json({ message: 'Number Already exit in Customer' })
            }
            const result = await collection.findOne({ number: parseInt(number) });
            if (!result) {
                return res.status(200).json({ status: 0 });
            }
            res.status(200).json({ status: 1, data: result })
        });

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}




const guarantorSchema = joi.object({
    name: joi.string().required(),
    number: joi.number().required(),
    aadharNumber: joi.number().required(),
    address: joi.string().required(),
    images: joi.any(),
    fatherName: joi.string().required(),
    otp: joi.any()
});


module.exports = { registerGuarantor, checkGurantor, viewGuarantorList, viewGaurantorByNumber, verifyGaurantor }