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


            return res.status(400).json({ message: 'Invalid request' });
        });
    } catch (error) {

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

                return res.status(400).json({ message: 'Bad request' });
            }
        });
    } catch (error) {

        return res.status(500).json({ message: 'Internal server error' });
    }
}


const allCreadit = async (req, res) => {
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
            const result = await collection.find({}, {
                projection: {
                    currentCredit: 1, _id: 0
                }
            }).toArray();

            // Calculate the sum of all credits
            const totalCredit = result.reduce((sum, item) => sum + item.currentCredit, 0);
            const formattedAmount = totalCredit.toFixed(2); // Returns a string with 2 decimal places
            const numberAmount = parseFloat(formattedAmount);
            res.status(200).json({ totalCredit: numberAmount });

        })

    } catch (error) {

        return res.status(500).json({ message: 'Internal server error' });
    }
}

const allUsersWallet = async (req, res) => {
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
            const collection = db.collection('users');
            const walletCollection = db.collection('wallets');

            // Fetch numbers of all users
            const usersResult = await collection.find({ role: 'user' }, { projection: { number: 1, _id: 0 } }).toArray();
            const numbers = usersResult.map(user => user.number);

            // Find wallets for all users based on their numbers
            const wallets = await walletCollection.find({ user_id: { $in: numbers } }).toArray();

            // Calculate the sum of all wallet amounts
            const totalAmount = wallets.reduce((sum, wallet) => sum + wallet.amount, 0);
            const formattedAmount = totalAmount.toFixed(2); // Returns a string with 2 decimal places
            const numberAmount = parseFloat(formattedAmount);
            return res.status(200).json({ totalAmount :numberAmount});
        });

    } catch (error) {

        return res.status(500).json({ message: 'Internal server error' });
    }
}


const allEmployeeWallet = async (req, res) => {
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
            const collection = db.collection('users');
            const walletCollection = db.collection('wallets');
            // Fetch numbers of all users
            const usersResult = await collection.find({ role: 'employee' }, { projection: { number: 1, _id: 0 } }).toArray();
            const numbers = usersResult.map(user => user.number);

            // Find wallets for all users based on their numbers
            const wallets = await walletCollection.find({ user_id: { $in: numbers } }).toArray();

            // Calculate the sum of all wallet amounts
            const totalAmount = wallets.reduce((sum, wallet) => sum + wallet.amount, 0);
            const formattedAmount = totalAmount.toFixed(2); // Returns a string with 2 decimal places
            const numberAmount = parseFloat(formattedAmount);
            return res.status(200).json({ totalAmount :numberAmount});
        });

    } catch (error) {
        console.error('Internal server error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}


const totalFileCharge = async (req, res) => {
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


            // Fetch numbers of all users
            const loans = await collection.find({}, { projection: { fileCharge: 1, _id: 0 } }).toArray();
            // Calculate the sum of all wallet amounts
            const totalAmount = loans.reduce((sum, wallet) => sum + wallet.fileCharge, 0);
            const formattedAmount = totalAmount.toFixed(2); // Returns a string with 2 decimal places
            const numberAmount = parseFloat(formattedAmount);
            return res.status(200).json({ totalAmount:numberAmount });
        });

    } catch (error) {
        console.error('Internal server error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}


const totalFileChargeCurrentMonth = async (req, res) => {
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

            // Get the current date
            const currentDate = new Date();

            // Get the first and last day of the current month
            const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

            // Set the last day to the end of the day
            lastDayOfMonth.setHours(23, 59, 59, 999);

            // Construct date filter for the current month
            const dateFilter = {
                purchaseDate: {
                    $gte: firstDayOfMonth,
                    $lte: lastDayOfMonth
                }
            };

            // Fetch numbers of all users filtered by current month
            const loans = await collection.aggregate([
                {
                    $addFields: {
                        purchaseDate: {
                            $dateFromString: {
                                dateString: '$purchaseDate',
                                format: '%d-%m-%Y'
                            }
                        }
                    }
                },
                {
                    $match: dateFilter
                },
                {
                    $project: {
                        fileCharge: 1,
                        purchaseDate: 1,
                        _id: 0
                    }
                }
            ]).toArray();



            // Calculate the sum of all file charges
            const totalAmount = loans.reduce((sum, loan) => sum + loan.fileCharge, 0);
            const formattedAmount = totalAmount.toFixed(2); // Returns a string with 2 decimal places
            const numberAmount = parseFloat(formattedAmount);
            return res.status(200).json({ totalAmount:numberAmount });
        });

    } catch (error) {
        console.error('Internal server error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};



const currentCreditCurrentmonth = async (req, res) => {
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

            // Get the current date
            const currentDate = new Date();

            // Get the first and last day of the current month
            const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

            // Set the last day to the end of the day
            lastDayOfMonth.setHours(23, 59, 59, 999);

            // Construct date filter for the current month
            const dateFilter = {
                purchaseDate: {
                    $gte: firstDayOfMonth,
                    $lte: lastDayOfMonth
                }
            };

            // Fetch numbers of all users filtered by current month
            const loans = await collection.aggregate([
                {
                    $addFields: {
                        purchaseDate: {
                            $dateFromString: {
                                dateString: '$purchaseDate',
                                format: '%d-%m-%Y'
                            }
                        }
                    }
                },
                {
                    $match: dateFilter
                },
                {
                    $project: {
                        currentCredit: 1,
                        purchaseDate: 1,
                        _id: 0
                    }
                }
            ]).toArray();



            // Calculate the sum of all file charges
            const totalAmount = loans.reduce((sum, loan) => sum + loan.currentCredit, 0);

            const formattedAmount = totalAmount.toFixed(2); // Returns a string with 2 decimal places
            const numberAmount = parseFloat(formattedAmount);
            res.status(200).json({ totalCredit: numberAmount });

        });

    } catch (error) {
        console.error('Internal server error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


module.exports = { viewDetailsCustomer, viewRegisterDevices, viewSoldDevices, viewShops, viewEmployees, allCreadit, allUsersWallet, allEmployeeWallet, totalFileCharge, totalFileChargeCurrentMonth, currentCreditCurrentmonth }
