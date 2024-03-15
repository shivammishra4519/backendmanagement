const { getDB } = require('../dbconnection');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const key = process.env.secretkey;
const { deviceDetails, sellDeviceDetails } = require('../model/add-device-model');
const moment = require('moment');
const crypto = require('crypto');


const sellDevice = async (req, res) => {
    try {
        const data = req.body;
        const validationError = sellDeviceDetails.validate(data);
        if (validationError.error) {
            return res.status(400).json({ message: validationError.error.message });
        }

        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ message: 'Unauthorized: Authorization header missing' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: Token missing' });
        }

        jwt.verify(token, key, async (err, decodedToken) => {
            if (err) {
                return res.status(401).json({ message: 'Unauthorized: Invalid token' });
            }

            const db = getDB();
            const collection = db.collection('selldevice');
            const result = await collection.findOne({ imei1: data.imei1 });
            if (result) {
                res.status(400).json({ message: 'Device already sold' });
            } else {

                const number = data.customerNumber;
                const financeAmount = data.financeAmount;
                const date = getCurrentDate();

                const purchaseDate = date; // Example purchase date
                const totalInstallments = parseInt(data.emi); // Total number of installments
                const installmentAmount = data.emiAmount; // Amount for each installment
                const installments = generateInstallments(purchaseDate, totalInstallments, installmentAmount);
                const loanId = generateUniqueReadableNumber();

                const emiCollection = db.collection('emidetails');
                const obj = {
                    user_id: parseInt(number),
                    installments,
                    loan_Id: loanId
                }

                const isAlreadyPresent = await emiCollection.findOne({ loan_id: loanId });

                if (isAlreadyPresent) {
                    return res.status(400).json({ 'message': 'bad request ' })
                }
                const loanInsert = await emiCollection.insertOne(obj);
                // wallet entry
                const wallet = db.collection('wallets');
                const filter = { user_id: parseInt(number) };
                const filter1 = { user_id: decodedToken.number };
                const update = { $inc: { credit: data.financeAmount } };
                const update1 = { $inc: { amount: data.mrp } };

                // Get amount before update
                const beforeUpdate1 = await wallet.findOne(filter);
                const beforeUpdate2 = await wallet.findOne(filter1);

                // Perform update and get updated document
                const result1 = await wallet.findOneAndUpdate(filter, update, { returnOriginal: true });
                const result2 = await wallet.findOneAndUpdate(filter1, update1, { returnOriginal: true });


                const afterUpdate1 = await wallet.findOne(filter);
                const afterUpdate2 = await wallet.findOne(filter1);



                data.loan_Id = loanId;
                data.date = date;
                const response = await collection.insertOne(data);
                const from = loanId;
                const to = decodedToken.number;
                const amount = data.mrp;


                const histroyDetails = createTransactionHistroy(from, to, amount)
                const transection = db.collection('transectiondetails');
                const transectionEntry = await transection.insertOne(histroyDetails)
                const toDetails = {
                    openingAmount: beforeUpdate2.amount,
                    closeingAmount: afterUpdate2.amount,
                    TransactionID: histroyDetails.TransactionID,
                    user_id: decodedToken.number
                }

                const fromDetails = {
                    openingAmount: beforeUpdate1.credit,
                    closeingAmount: afterUpdate1.credit,
                    TransactionID: histroyDetails.TransactionID,
                    user_id: parseInt(number)
                }
                const openingCollection = db.collection('OpeningAndCloseing');
                const datainsert = await openingCollection.insertOne(toDetails);
                const datainsert1 = await openingCollection.insertOne(fromDetails);
                const details = createTransactionHistroy()
                res.status(200).json(response);
            }
        });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}





function generateInstallments(purchaseDate, totalInstallments, installmentAmount) {
    const installments = [];
    const purchaseMoment = moment(purchaseDate);
    const isAfter24 = purchaseMoment.date() >= 24;
    let currentDate = purchaseMoment.clone().startOf('month');

    if (isAfter24) {
        currentDate.add(2, 'months').startOf('month');
    } else {
        currentDate.add(1, 'months').startOf('month');
    }

    for (let i = 0; i < totalInstallments; i++) {
        const dueDate = currentDate.clone().add(i, 'months').startOf('month');
        const formattedDueDate = dueDate.format('DD-MM-YYYY'); // Format date as "dd-mm-yyyy"
        const installment = {
            dueDate: formattedDueDate,
            amount: installmentAmount,
            paid: false,
            installmentId: (`EMI${i}`)
        };
        installments.push(installment);
    }

    return installments;
}








function generateUniqueReadableNumber() {
    // Generate timestamp
    const timestamp = Date.now().toString();

    // Define characters to use
    const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

    // Generate random characters
    let randomPart = '';
    for (let i = 0; i < 4; i++) {
        randomPart += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    // Concatenate timestamp and random characters
    const uniqueNumber = timestamp + randomPart;

    return uniqueNumber;
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


function createTransactionHistroy(from, to, amount) {
    const currentTime = getCurrentTime();
    const date = new Date();
    const obj = {
        from: from,
        to: to,
        amount: amount,
        time: currentTime,
        date: date,
        TransactionID: generateTransactionID()
    }
    return obj

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

// Example usage




const viewDeviceList = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ message: 'Unauthorized: Authorization header missing' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: Token missing' });
        }

        jwt.verify(token, key, async (err, decodedToken) => {
            if (err) {
                return res.status(401).json({ message: 'Unauthorized: Invalid token' });
            }
            console.log('he')
            const db = getDB();
            const collection = db.collection('selldevice');
            const result = await collection.find().toArray();
            res.status(200).json(result)
        });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
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

// Example usage




const filterData = async (req, res) => {
    try {
        const { fromDate, toDate } = req.body; // Assuming fromDate and toDate are provided in the request body
        const db = getDB();
        const collection = db.collection('selldevice');
        console.log(fromDate, toDate);

        // Construct the query
        const query = {
            date: {
                $gte: new Date(fromDate),
                $lt: new Date(toDate)
            }
        };

        // Execute the query
        const filteredData = await collection.find(query).toArray();

        // Return the filtered data
        return res.status(200).json(filteredData);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}





module.exports = { sellDevice, viewDeviceList, getCurrentDate, generateTransactionID, createTransactionHistroy, getCurrentTime,filterData }