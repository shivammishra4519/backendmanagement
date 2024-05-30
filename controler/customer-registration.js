const jwt = require('jsonwebtoken');
const { customerschema } = require('../model/customer-registration');
const { getCurrentDate } = require('./functions')
const { getDB } = require('../dbconnection');
const { createWallet } = require('../controler/wallet');

require('dotenv').config();

const key = process.env.secretkey;

const customerRegister = async (req, res) => {
    try {
        const data = req.body;
        const validationResult = customerschema.validate(data);
        if (validationResult.error) {
            return res.status(400).json({ error: validationResult.error.details.map(d => d.message) });
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
                return res.status(401).json({ error: 'Unauthorized: Invalid token' });
            }
            try {
                const db = getDB();
                const collection = db.collection('customers');

                const query = {
                    "$or": [
                        { "number": data.number },
                        { "email": data.email },
                        { "adharCardNumber": data.adharCardNumber },
                    ]
                }

                const isUserExit = await collection.findOne(query);
                if (isUserExit) {
                    return res.status(400).json({ message: 'Customer Alreday exit' });
                }

                data.active = true;
                if (!data.shop) {
                    data.shop = decodedToken.shop;
                    data.registerId = decodedToken.number;
                }
                const role = decodedToken.role;
                if (role == 'admin' || role == 'employee') {
                    data.registerId = decodedToken.number
                }
                delete data.otp;
                delete data.adharOtp;
                const date = getCurrentDate();
                data.registerDate = date;
                const result = await collection.insertOne(data);

                return res.status(200).json({ message: 'Customer registered successfully' });
            } catch (error) {
                console.error('Error:', error);
                return res.status(500).json({ error: 'Internal server error' });
            }
        });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const customerList = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];

        if (!authHeader) {
            return res.status(401).json({ error: 'Unauthorized: Authorization header missing' });
        }

        // Extracting the token part after "Bearer "
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
                const collection = db.collection('customers');
                const role = decodedToken.role;
                if (role == 'admin' || role == 'employee') {
                    const result = await collection.find().toArray();
                    return res.status(200).json(result);
                }
                const shop = decodedToken.shop;
                const result = await collection.find({ shop: shop }).toArray();
                if (result) {
                    return res.status(200).json(result)
                }
                return res.status(400).json({ message: 'data not found' })

            } catch (error) {

                return res.status(500).json({ error: 'Internal server error' });
            }
        });
    } catch (error) {

        return res.status(500).json({ error: 'Internal server error' });
    }
};


const viewAllData = async (req, res) => {
    try {
        const data = req.body;

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
                const collection = db.collection('customers');
                const resultCursor = await collection.findOne({ adharCardNumber: data.adharCardNumber });
                return res.status(200).json(resultCursor);
            } catch (error) {

                return res.status(500).json({ error: 'Internal server error' });
            }
        });
    } catch (error) {

        return res.status(500).json({ error: 'Internal server error' });
    }
};


const filterCustomer = async (req, res) => {
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
                const data = req.body;

                const db = getDB();
                const collection = db.collection('customers');
                const number = data.number;
                const aadhar = data.adharCardNumber;
                if (aadhar) {
                    const resultCursor = await collection.findOne({ adharCardNumber: data.adharCardNumber });
                    return res.status(200).json(resultCursor);
                }
                if (number) {
                    const resultCursor = await collection.findOne({ number: number });
                    return res.status(200).json(resultCursor);
                }
                res.status(400).json({ message: 'invalid request' })
            } catch (error) {

                return res.status(500).json({ error: 'Internal server error' });
            }
        });
    } catch (error) {

        return res.status(500).json({ error: 'Internal server error' });
    }
}


const verifyCustomer = async (req, res) => {
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
            const data = req.body;

            const number = data.number;
            if (!number) {
                return res.status(400).json({ message: 'Something went wrong' });
            }
            const db = getDB();
            const collection = db.collection('customers');

            const customerData = await collection.findOne({ number: parseInt(number) });

            if (!customerData) {
                return res.status(404).json({ message: 'Customer not found' });
            }
            res.status(200).json(customerData);
        });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}


const isCustomerPresent = async (req, res) => {
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
            const db = getDB();
            const collection = db.collection('customers');
            const data = req.body;
            const query = {
                "$or": [
                    { "number": data.number },
                    { "email": data.email },
                    { "adharCardNumber": data.adharCardNumber },
                ]
            }

            const isUserExit = await collection.findOne(query);

            if (isUserExit) {
                return res.status(200).json({ status: 1, message: 'Customer Alreday exit' });
            }
            res.status(200).json({ status: 0, message: 'Customer Not exit' })
        });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

const viewCustomerImageName = async (req, res) => {
    try {
        const db = getDB();
        const collection = db.collection('customers');

        const data = req.body;
        if (!data) {
            return res.status(400).json({ message: 'data not found' })
        }
        const result = await collection.findOne({ number: data.number });
        if (result) {
            const images = result.images;
            return res.status(200).json(images)
        }
        res.status(400).json({ message: 'data not found' })
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}


const findCustomerByManyId = async (req, res) => {
    try {
        const { userInput } = req.body;

      

        if (!userInput) {
            return res.status(400).json({ message: 'No search value found' });
        }

        const db = getDB();
        const collection = db.collection('selldevice');

        const query = {
            $or: [
                { imei1: userInput },
                { loanId: userInput },
                { customerNumber: parseInt(userInput) },
                { loanKey: userInput }
            ]
        };

        const result = await collection.findOne(query);

        if (result) {
            return res.status(200).json(result);
        }

        return res.status(404).json({ message: 'Customer not found' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};



module.exports = { customerRegister, customerList, viewAllData, filterCustomer, verifyCustomer, isCustomerPresent, viewCustomerImageName, findCustomerByManyId };
