const { getDB } = require('../dbconnection');
const jwt = require('jsonwebtoken');
const {  generateTransactionID, createTransactionHistroy } = require('../controler/sell-device')
// const bcrypt = require('bcrypt');
require('dotenv').config();
const key = process.env.secretkey;


const viewEmidetailsByNumber = async (req, res) => {
    try {
        const data = req.body;
        if (!data) {
            return res.status(400).json({ 'message': 'bad request' });
        }

        const db = getDB()
        const collection = db.collection('selldevice');
        const number = data.number;
        const strNumber = number.toString()
        const result = await collection.findOne({ customerNumber: strNumber });

        if (!result) {
            return res.status(400).json({ message: 'invalid user id' })
        }

        res.status(200).json(result)



    } catch (error) {
        res.status(400).json(error)
    }
}
const payInstallment = async (req, res) => {
    try {
        const data = req.body;
        const authHeader = req.headers['authorization'];

        if (!authHeader)
            return res.status(401).json({ message: 'Unauthorized: Authorization header missing' });

        const token = authHeader.split(' ')[1];
        if (!token)
            return res.status(401).json({ message: 'Unauthorized: Token missing' });

        jwt.verify(token, key, async (err, decodedToken) => {
            if (err)
                return res.status(401).json({ message: 'Unauthorized: Invalid token' });

            const employeId = decodedToken.number;
            const db = getDB();
            const wallet = db.collection('wallets');
            const collection = db.collection('users');
            const emiCollection = db.collection('selldevice');

            const balanceCheck = await wallet.findOne({ user_id: employeId });
            if (!balanceCheck)
                return res.status(400).json({ message: 'Something went wrong with employer balance check' });

            if (balanceCheck.amount < data.amount)
                return res.status(400).json({ message: 'Insufficient balance' });

            const result = await collection.findOne({ number: employeId });
            const dbPin = result.pin;
            const isPinMatched = (dbPin == data.pin);

            if (!isPinMatched)
                return res.status(400).json({ message: 'Incorrect PIN' });

            const customerCheck = await wallet.findOne({ user_id: parseInt(data.user_id) });
            if (!customerCheck)
                return res.status(400).json({ message: 'Something went wrong with customer check' });

            if (!(customerCheck.credit >= data.amount))
                return res.status(400).json({ message: 'No credit amount available for the customer' });

            const filter = {
                loanId: data.loan_Id,
                "installments.installmentId": data.installmentId
            };

            const isAlreadyPaid = await emiCollection.findOne(filter);
            if (!isAlreadyPaid)
                return res.status(400).json({ message: 'Invalid loan ID or installment ID' });

            const installments = isAlreadyPaid.installments;
            const obj = installments.find(installment => installment.installmentId === data.installmentId);
            const paid = obj.paid;
            if (paid)
                return res.status(400).json({ message: 'EMI already paid' });

            // Update employer and customer balances
            const senderOpeningAmount = balanceCheck.amount;
            const receiverOpeningAmount = customerCheck.credit;

            const senderFilter = { user_id: employeId };
            const receiverFilter = { user_id: parseInt(data.user_id) };

            const updateSender = { $inc: { amount: -data.amount } };
            const updateReceiver = { $inc: { credit: -data.amount } };

            const result1 = await wallet.findOneAndUpdate(senderFilter, updateSender, { returnOriginal: true });
            const result2 = await wallet.findOneAndUpdate(receiverFilter, updateReceiver, { returnOriginal: true });

            const senderClosingAmount = result1.amount;
            const receiverClosingAmount = result2.credit;

            // Record transaction history
            const transectionHistory = db.collection('transectiondetails');

            const transectionInfo = {
                senderDetails: { senderOpeningAmount, senderClosingAmount },
                receiverDetails: { receiverOpeningAmount, receiverClosingAmount },
                TransactionID: generateTransactionID(),
                time: getCurrentTime(),
                date: getCurrentDate(),
                amount: data.amount,
                senderId: decodedToken.number,
                receiverId: parseInt(data.user_id),
                type: 'direct'
            };

            const createTransactionHistory = await transectionHistory.insertOne(transectionInfo);
            if (!createTransactionHistory)
                return res.status(400).json({ message: 'Failed to record transaction history' });

            // Update EMI installment status
            const payDate=getCurrentDate();
            console.log(payDate);
            const update = {
                $set: {
                    "installments.$[elem].paid": true,
                    "installments.$[elem].payDate": payDate
                }
            };

            const options = {
                arrayFilters: [{ "elem.installmentId": data.installmentId }],
                returnOriginal: false
            };

            const updatedEmi = await emiCollection.findOneAndUpdate(filter, update, options);

            if (!updatedEmi)
                return res.status(400).json({ message: 'Failed to update EMI installment status' });

            // Transfer payment to admin
            const admin = await collection.findOne({ role: 'admin' });
            if (!admin)
                return res.status(400).json({ message: 'Something went wrong finding admin' });

            const adminId = admin.number;
            const adminWallet = await wallet.findOne({ user_id: adminId });

            const adminOpening = adminWallet.amount;
            const adminFilter = { user_id: adminId };
            const adminUpdate = { $inc: { amount: data.amount } };

            const resultAdmin = await wallet.findOneAndUpdate(adminFilter, adminUpdate, { returnOriginal: true });
            const adminClosing = resultAdmin.amount;

            const adminTransactionInfo = {
                senderDetails: {
                    senderOpeningAmount: receiverOpeningAmount,
                    senderClosingAmount: receiverClosingAmount
                },
                receiverDetails: {
                    receiverOpeningAmount: adminOpening,
                    receiverClosingAmount: adminClosing
                },
                TransactionID: generateTransactionID(),
                time: getCurrentTime(),
                date: getCurrentDate(),
                amount: data.amount,
                senderId: parseInt(data.user_id),
                receiverId: adminId,
                type: 'emi paid'
            };

            const createAdminTransaction = await transectionHistory.insertOne(adminTransactionInfo);
            if (!createAdminTransaction)
                return res.status(400).json({ message: 'Failed to record admin transaction' });

            res.status(200).json({ message: 'EMI paid successfully' });
        });
    } catch (error) {
        res.status(400).json({ message: 'Internal server error', error });
    }
}




const viewPaidEmi = async (req, res) => {
    try {
        const db = getDB();
        console.log('paid emi')
        const collection = db.collection('paidemi');
        const result = await collection.find().toArray();
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json(error)
    }
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
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // January is 0!
    const year = currentDate.getFullYear();
    return `${day}-${month}-${year}`;
}

module.exports = { viewEmidetailsByNumber, payInstallment, viewPaidEmi }




