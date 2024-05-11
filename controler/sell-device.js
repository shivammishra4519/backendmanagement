const { getDB } = require('../dbconnection');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const key = process.env.secretkey;
const adminId = process.env.admin;
const adminstratorId = process.env.adminstrator;
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
            const query = {
                "$or": [
                    { imei1: data.imei1 },
                    { imei2: data.imei2 },
                ]
            }
            const result = await collection.findOne(query);

            if (result) {
                return res.status(400).json({ message: 'Device already sold' });
            }

            // checking user 
            const number = data.customerNumber;
            const iSCustomerExit = await db.collection('customers').findOne({ number: parseInt(number) });
            if (!iSCustomerExit) {
                return res.status(400).json({ message: 'customer not exit' })
            }

            const totalInstallments = parseInt(data.emi); // Total number of installments
            const installmentAmount = data.emiAmount;
            const installments = generateInstallments(totalInstallments, installmentAmount);
            const loanId = generateUniqueReadableNumber();
            data.loanId = loanId;
            data.installments = installments;
            data.purchaseDate = getCurrentDate();
            data.time = getCurrentTime();
            data.shop = decodedToken.shop;
            data.currentCredit = data.financeAmount;



            // first transection admin to customer 
            const loanWallet = db.collection('loanwallets');
            const objwallet = {
                loanId: loanId,
                credit: data.financeAmount
            }

            const check = await loanWallet.findOne({ loanId: loanId });
            if (check) {
                return res.status(400).josn({ error: 'somtheing went wrong loanId' });
            }
            const insertIdWallet = await loanWallet.insertOne(objwallet);
            if (!insertIdWallet) {
                return res.status(400).json({ error: 'database error' })
            };

            const wallet = db.collection('wallets');
            const transectionHistory = db.collection('transectiondetails');
            // transection of remaning amount of shopkeeper from admin  
            const amountCreaditToShop = data.mrp - data.downPayment;  // calulating amount 
            const find = await db.collection('users').findOne({ role: 'admin' }, { projection: { number: 1, _id: 0 } });

            if (!find) {
                return res.status(200).json({ message: 'Admin wallet not found' });
            }


            const filterAdmin = { user_id: find.number };
            const updateAdmin = { $inc: { amount: - amountCreaditToShop } };

            const adminWalet = await wallet.findOne(filterAdmin);
            if (adminWalet.amount < amountCreaditToShop) {
                return res.status(400).json({ error: 'invalid request' })
            }
            const resultAdmin = await wallet.findOneAndUpdate(filterAdmin, updateAdmin, { returnOriginal: false });

            if (!resultAdmin) {
                return res.status(400).json({ error: 'somtheing went wrong1' })
            }
            const adminWaletAfterF = await wallet.findOne(filterAdmin);

            if (!resultAdmin) {
                const updateAdmin = { $inc: { amount: amountCreaditToShop } };
                await wallet.findOneAndUpdate(filterAdmin, updateAdmin, { returnOriginal: false });
                return res.status(400).json({ error: 'somtheing went wrong2' })
            }

            const filter1Shop = { user_id: decodedToken.number };
            const shopWallet = await wallet.findOne(filter1Shop);

            if (!shopWallet) {
                const updateAdmin = { $inc: { amount: amountCreaditToShop } };
                await wallet.findOneAndUpdate(filterAdmin, updateAdmin, { returnOriginal: false });
                return res.status(400).json({ error: 'somtheing went wrong3' })
            }

            const update1Shop = { $inc: { amount: amountCreaditToShop } };
            const shopResult = await wallet.findOneAndUpdate(filter1Shop, update1Shop, { returnOriginal: false });

            if (!shopResult) {
                const updateAdmin = { $inc: { amount: amountCreaditToShop } };
                await wallet.findOneAndUpdate(filterAdmin, updateAdmin, { returnOriginal: false });
                return res.status(400).json({ error: 'somtheing went wrong4' })
            }

            const shopWalletA = await wallet.findOne(filter1Shop);

            if (!shopWalletA) {
                const update1Shop = { $inc: { amount: - amountCreaditToShop } };
                const shopResult = await wallet.findOneAndUpdate(filter1Shop, update1Shop, { returnOriginal: false });
                const updateAdmin = { $inc: { amount: amountCreaditToShop } };
                await wallet.findOneAndUpdate(filterAdmin, updateAdmin, { returnOriginal: false });
                return res.status(400).json({ error: 'somtheing went wrong5' })
            }
            const tId = generateTransactionID();
            const transectionInfo = {
                senderDetails: {
                    senderOpeningAmount: adminWalet.amount,
                    senderCloseingAmount: adminWaletAfterF.amount
                },
                receverDetails: {
                    receverOpeningAmount: shopWallet.amount,
                    receverCloseingAmount: shopWalletA.amount
                },
                TransactionID: tId,
                date: getCurrentDate(),
                time: getCurrentTime(),
                amount: amountCreaditToShop,
                senderId: parseInt(adminId),
                receverId: decodedToken.number,
                type: 'direct',
                loanId: loanId
            }

            const tid1 = generateTransactionID();

            const loanHistory = {
                customerId: parseInt(number),
                loanId: loanId,
                type: 'loan',
                LoanAmount: amountCreaditToShop,
                totalAmount: data.financeAmount,
                date: getCurrentDate(),
                time: getCurrentTime(),
                interest: data.interest,
                fileCharge: data.fileCharge,
                TransactionID: tid1,
            }


            const createTransactionHistroy = await transectionHistory.insertOne(transectionInfo);
            if (!createTransactionHistroy) {
                const update1Shop = { $inc: { amount: - amountCreaditToShop } };
                await wallet.findOneAndUpdate(filter1Shop, update1Shop, { returnOriginal: false });
                const updateAdmin = { $inc: { amount: amountCreaditToShop } };
                await wallet.findOneAndUpdate(filterAdmin, updateAdmin, { returnOriginal: false });
                return res.status(400).json({ error: 'somtheing went wrong' });
            }
            const loanRecord = await transectionHistory.insertOne(loanHistory);
            if (!loanRecord) {
                const update1Shop = { $inc: { amount: - amountCreaditToShop } };
                await wallet.findOneAndUpdate(filter1Shop, update1Shop, { returnOriginal: false });
                const updateAdmin = { $inc: { amount: amountCreaditToShop } };
                await wallet.findOneAndUpdate(filterAdmin, updateAdmin, { returnOriginal: false });
                await transectionHistory.deleteOne({ TransactionID: tId });
                return res.status(400).json({ error: 'somtheing went wrong' });
            }

            if (!createTransactionHistroy) {
                const update1Shop = { $inc: { amount: - amountCreaditToShop } };
                await wallet.findOneAndUpdate(filter1Shop, update1Shop, { returnOriginal: false });
                const updateAdmin = { $inc: { amount: amountCreaditToShop } };
                await wallet.findOneAndUpdate(filterAdmin, updateAdmin, { returnOriginal: false });
                await transectionHistory.deleteOne({ TransactionID: tId });
                await transectionHistory.deleteOne({ TransactionID: tid1 });
                return res.status(400).json({ error: 'somtheing went wrong' })
            }
            const lengthOfCollection = await collection.find().toArray();
            const lengthCol = lengthOfCollection.length;

            const currentYear = new Date().getFullYear();
            const invoice = currentYear.toString() + lengthCol.toString();
            data.invoice = invoice;
            data.penality = 0;

            const isInsertResult = await collection.insertOne(data);

            if (!isInsertResult) {
                const update1Shop = { $inc: { amount: - amountCreaditToShop } };
                await wallet.findOneAndUpdate(filter1Shop, update1Shop, { returnOriginal: false });
                const updateAdmin = { $inc: { amount: amountCreaditToShop } };
                await wallet.findOneAndUpdate(filterAdmin, updateAdmin, { returnOriginal: false });
                await transectionHistory.deleteOne({ TransactionID: tId });
                await transectionHistory.deleteOne({ TransactionID: tid1 });
                return res.status(400).json({ error: 'somtheing went wrong' })
            }
            const resObj = {
                shopId: decodedToken.number,
                loanId: loanId,
                invoice: invoice
            }


            res.status(200).json(resObj)

        });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}






function generateInstallments(totalInstallments, installmentAmount) {
    const installments = [];
    const purchaseMoment = moment(); // Get the current date
    let currentDate = purchaseMoment.clone().add(1, 'months').startOf('month');
    if (purchaseMoment.date() >= 24) {
        currentDate.add(1, 'months');
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


            const db = getDB();
            const collection = db.collection('selldevice');
            const role = decodedToken.role;
            if (role == 'admin' || role == 'employee') {
                const result = await collection.find().toArray();
                if (result) {
                    return res.status(200).json(result);
                }
                res.status(400).json({ message: 'data not found' })
            }
            const shop = decodedToken.shop;

            const result = await collection.find({ shop: shop }).toArray();
            if (result) {
                return res.status(200).json(result);
            }
            res.status(400).json({ message: 'data not found' })
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

const viewAllLoansByCustomerId = async (req, res) => {
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

            const data = req.body;
            const db = getDB();
            const collection = db.collection('selldevice');
            const result = await collection.find({ customerNumber: data.number }).toArray();
            if (result) {
                return res.status(200).json(result)
            }
            res.status(400).josn({ message: 'somtheing went wriong' })
        });

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}




const viewAlldeviceSold = async (req, res) => {
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


            const db = getDB();
            const collection = db.collection('selldevice');
            const role = decodedToken.role;
            if (role == 'admin' || role == 'employee') {
                const result = await collection.find().toArray();
                if (result) {
                    return res.status(200).json(result);
                }
                res.status(400).json({ message: 'data not found' })
            }
            const shop = decodedToken.shop;

            const result = await collection.find({ shop: shop }).toArray();
            if (result) {
                return res.status(200).json(result);
            }
            res.status(400).json({ message: 'data not found' })
        });

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}




const filterDataByDate = async (req, res) => {
    try {
        const { from, to, number } = req.body; // Destructure the request body to get the 'from', 'to', and 'number' properties

        const db = getDB();
        const collection = db.collection('selldevice');


        const matchStage = {
            $match: {}
        };

        // If 'from' and 'to' dates are provided, add them to the $match stage
        if (from && to) {
            matchStage.$match.purchaseDate = {
                $gte: new Date(from),
                $lte: new Date(to)
            };
        }

        // If 'number' is provided, add it to the $match stage
        if (number) {
            matchStage.$match.customerNumber = number;
        }

        const result = await collection.aggregate([
            {
                $addFields: {
                    purchaseDate: {
                        $dateFromString: {
                            dateString: '$purchaseDate',
                            format: '%d-%m-%Y' // Specify the format of the date string
                        }
                    }
                }
            },
            matchStage // Use the dynamically created $match stage
        ]).toArray();

        res.status(200).json(result);

    } catch (error) {
        console.error('Internal server error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}




module.exports = { sellDevice, viewDeviceList, getCurrentDate, generateTransactionID, createTransactionHistroy, getCurrentTime, filterData, viewAlldeviceSold, filterDataByDate, viewAllLoansByCustomerId }