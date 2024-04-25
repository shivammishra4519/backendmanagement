const { getDB } = require('../dbconnection');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const key = process.env.secretkey;
const tokenExpiry = '12h';


const viewDetailsCustomer = async (req, res) => {
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
            const role = decodedToken.role;
            if (role == 'admin' || role == 'employee') {
                const result = await collection.find().toArray();
                const total = result.length;
                return res.status(200).json({ totalCustomers: total });
            }

            if (role == 'user') {
                const userCollection = db.collection('users');
                const result = await userCollection.findOne({ number: decodedToken.number });

                const shopName = result.shopName;

                const customer = await collection.find({ shop: shopName }).toArray();

                const total = customer.length;
                return res.status(200).json({ totalCustomers: total });

            }

            res.status(400).json({ message: 'bad request' });

        });
    } catch (error) {
        return res.status(500).json({ 'message': 'Internal server error' });
    }
}




const viewRegisterDevices = async (req, res) => {
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
            const collection = db.collection('devices');
            const result = await collection.find().toArray();
            if (!result) {
                return res.status(400).json({ message: 'somtheing went wrong' })
            }
            const totalCount = result.length;

            return res.status(200).json({ response: totalCount })


        });
    } catch (error) {
        return res.status(500).json({ 'message': 'Internal server error' });
    }
}



const viewSoldDevices = async (req, res) => {
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
            const collection = db.collection('selldevice');
            const result = await collection.find().toArray();
            if (!result) {
                return res.status(400).json({ message: 'somtheing went wrong' })
            }
            const totalCount = result.length;

            return res.status(200).json({ response: totalCount })


        });
    } catch (error) {
        return res.status(500).json({ 'message': 'Internal server error' });
    }
}


const viewShops = async (req, res) => {
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
                console.error('JWT verification error:', err);
                return res.status(401).json({ error: 'Unauthorized: Invalid token' });
            }
            const role = decodedToken.role;
            const db = getDB();
            const collection = db.collection('users');
            if (role == 'admin' || role === 'employee') {
                const query = { shopName: { $exists: true } };
                const result = await collection.find(query).toArray();
                const total = result.length;
                return res.status(200).json({ totalShops: total, });
            }

            console.error('Invalid role:', role);
            return res.status(400).json({ message: 'Invalid request' });
        });
    } catch (error) {
        console.error('Internal server error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}



const viewEmployees = async (req, res) => {
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
                console.error('JWT verification error:', err);
                return res.status(401).json({ error: 'Unauthorized: Invalid token' });
            }

            const db = getDB();
            const collection = db.collection('users');
            const role = decodedToken.role;
            if (role == 'admin') {
                const result = await collection.find({ role: 'employee' }).toArray();
                const total = result.length;
                return res.status(200).json({ totalEmployees: total });
            } else {
                console.error('Invalid role:', role);
                return res.status(400).json({ message: 'Bad request' });
            }
        });
    } catch (error) {
        console.error('Internal server error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}


const allCreadit = async (req, res) => {
    try {
        // const authHeader = req.headers['authorization'];
        // if (!authHeader) {
        //     return res.status(401).json({ error: 'Unauthorized: Authorization header missing' });
        // }

        // const token = authHeader.split(' ')[1];
        // if (!token) {
        //     return res.status(401).json({ error: 'Unauthorized: Token missing' });
        // }

        // jwt.verify(token, key, async (err, decodedToken) => {
        //     if (err) {
        //         console.error('JWT verification error:', err);
        //         return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        //     }
        const db = getDB();
        const collection = db.collection('loanwallets');
        const result = await collection.find({}, {
            projection: {
                credit: 1, _id: 0
            }
        }).toArray();

        // Calculate the sum of all credits
        const totalCredit = result.reduce((sum, item) => sum + item.credit, 0);

        res.status(200).json({ totalCredit });

        // })

    } catch (error) {
        console.error('Internal server error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}






module.exports = { viewDetailsCustomer, viewRegisterDevices, viewSoldDevices, viewShops, viewEmployees, allCreadit }
