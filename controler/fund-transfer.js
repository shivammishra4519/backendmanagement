const { getDB } = require('../dbconnection');
const { fundTransfer } = require('../model/fund-transfer-model');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const key = process.env.secretkey;
const fundTransferFunction = async (req, res) => {
    try {

        const data = req.body;

        const number = parseInt(data.user_id);
        const validationError = fundTransfer.validate(data);
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
                return res.status(401).json({ error: 'Unauthorized: Invalid token' });
            }
            try {
                const db = getDB();
                const collection = db.collection('wallets');
                if (data.amount <= 0) {
                    return res.status(400).json({ error: 'invalid amount' })
                }
                const checkAmount = await collection.findOne({ user_id: decodedToken.number });
                const amount = checkAmount.amount;
                if (amount < data.amount) {
                    return res.status(400).json({ message: 'insufcence balnce' });
                }

                const userCollection = db.collection('users');
                const userExit = await userCollection.findOne({ number: decodedToken.number });
                if (!userExit) {
                    return res.status(400).json({ message: 'invalid creadintails' })
                }
                const checkUser = await collection.findOne({ user_id: number });
                if (!checkUser) {
                    return res.status(400).json({ message: 'user not found' });
                }

                // pin checking
                const dbPin = userExit.pin;
                const pin = parseInt(data.pin);
                const isPinCorrect = (dbPin == pin);

                if (!isPinCorrect) {
                    return res.status(400).json({ message: 'incoorect Pin' })
                }
                const senderOpeningAmount = checkAmount.amount;
                const receverOpeningAmount = checkUser.amount;

                const filterRecever = { user_id: parseInt(number) };
                const filterSender = { user_id: decodedToken.number };
                const updateRecever = { $inc: { amount: data.amount } };
                const updateSender = { $inc: { amount: -data.amount } };
                // Perform update and get updated document
                const result1 = await collection.findOneAndUpdate(filterSender, updateSender, { returnOriginal: true });
                const result2 = await collection.findOneAndUpdate(filterRecever, updateRecever, { returnOriginal: true });


                const checkAmountAfter = await collection.findOne({ user_id: decodedToken.number });
                const checkUserAfter = await collection.findOne({ user_id: number });
                const transectionHistory = db.collection('transectiondetails');

                const senderCloseingAmount = checkAmountAfter.amount;
                const receverCloseingAmount = checkUserAfter.amount;


                const TransactionID = generateTransactionID();
                const time = getCurrentTime();
                console.log('timw', getCurrentTime())
                console.log(time)
                const date = getCurrentDate();
                const transferAmount = data.amount;
                const senderId = decodedToken.number;
                const receverId = number;
                const transectionInfo = {
                    senderDetails: {
                        senderOpeningAmount,
                        senderCloseingAmount
                    },
                    receverDetails: {
                        receverOpeningAmount,
                        receverCloseingAmount
                    },
                    TransactionID,
                    time,
                    date,
                    amount: transferAmount,
                    senderId,
                    receverId,
                    type: 'direct'
                }

                const createTransactionHistroy = await transectionHistory.insertOne(transectionInfo);

                if (!createTransactionHistroy) {
                    return res.status(400).json({ message: 'invalid request' })
                }

                return res.status(200).json({ message: 'Fund Transfer successfully', data: createTransactionHistroy });



            } catch (error) {
                return res.status(500).json({ error: 'Internal server error' });
            }
        });

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}





function generateTransactionID() {
    // Generate timestamp
    const timestamp = Date.now().toString();

    // Define characters to use
    const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    // Generate random characters
    let randomPart = '';
    for (let i = 0; i < 4; i++) {
        randomPart += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    // Concatenate timestamp and random characters
    const uniqueNumber = timestamp + randomPart;

    return uniqueNumber;
}

function getCurrentTime() {
    const currentDate = new Date();

    // Extract time components
    const hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    const seconds = currentDate.getSeconds();

    // Format time as HH:MM:SS
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    return formattedTime;
}

function getCurrentDate() {
    // Get current date
    const currentDate = new Date();

    // Extract day, month, and year
    const day = currentDate.getDate().toString().padStart(2, '0');
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Note: Months are zero-based
    const year = currentDate.getFullYear();

    // Create the date string in the format dd-mm-yyyy
    const formattedDate = `${day}-${month}-${year}`;

    return formattedDate;
}





const transectiondetails = async (req, res) => {
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
            const collection = db.collection('transectiondetails');

            const role = decodedToken.role;
            // if (role == 'admin') {
            //     const filterData = await collection.find({ type: 'direct' }).sort({ createdAt: -1 }).limit(100).toArray();
            //     return res.status(200).json(filterData);
            // }
            const number = decodedToken.number;
            const filterData = await collection
            .find({ type: 'direct', $or: [{ senderId: number }, { receverId: number }] })
            .toArray();
        return res.status(200).json(filterData);
        
            

        });

    } catch (error) {
        // Handling errors
        return res.status(500).json({ error: 'Internal server error' });
    }
}


module.exports = { fundTransferFunction, transectiondetails }