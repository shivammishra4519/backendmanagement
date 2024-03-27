const { getDB } = require('../dbconnection');
const jwt = require('jsonwebtoken');
const { getCurrentDate, generateTransactionID, createTransactionHistroy } = require('../controler/sell-device')
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
        const number=data.number;
        const strNumber=number.toString()
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
            const employeId = decodedToken.number;
            const db = getDB();
            const wallet = db.collection('wallets');
            const balanceCheck = await wallet.findOne({ user_id: employeId });
            // checking employer
            if (!balanceCheck) {
                return res.status(400).json({ 'message': 'somtheing went wrong 1' });
            }

            // checking employer amount
            if (balanceCheck.amount < data.amount) {
                return res.status(400).json({ message: 'insufficenet balance' })
            }

            const collection = db.collection('users');
            const result = await collection.findOne({ number: employeId });
            const dbPin = result.pin;
            const isPinMatched = (dbPin == data.pin);

            // comapre password
            if (!isPinMatched) {
                return res.status(400).json({ 'message': 'incoorect pin' });
            }
            // Return success response
            const customerCheck = await wallet.findOne({ user_id: parseInt(data.user_id )});
            // checking user exitence

            if (!customerCheck) {
                return res.status(400).json({ message: 'somtheing went wrong 1' });
            }

            // checking creadit of customer
           
            if (!(customerCheck.credit >= data.amount)) {
                return res.status(400).json({ message: 'No creadit amount' })
            }

            // creating details for history employer to customer
            const senderOpeningAmount = balanceCheck.amount;
            const receverOpeningAmount = customerCheck.credit;
            const filterRecever = { user_id: parseInt(data.user_id) };
            const filterSender = { user_id: decodedToken.number };
            const updateRecever = { $inc: { credit: -data.amount } };
            const updateSender = { $inc: { amount: -data.amount } };
            // Perform update and get updated document
            const result1 = await wallet.findOneAndUpdate(filterSender, updateSender, { returnOriginal: true });
            const result2 = await wallet.findOneAndUpdate(filterRecever, updateRecever, { returnOriginal: true });
            const checkAmountAfter = await wallet.findOne({ user_id: employeId });
            const customerCheckAfter = await wallet.findOne({ user_id: parseInt(data.user_id )});
            const transectionHistory = db.collection('transectiondetails');

            const senderCloseingAmount = checkAmountAfter.amount;
            const receverCloseingAmount = customerCheckAfter.credit;

            const TransactionID = generateTransactionID();
            const time = getCurrentTime();
            const date = getCurrentDate();
            const transferAmount = data.amount;
            const senderId = decodedToken.number;
            const receverId = data.user_id;
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

            //  end of empolyer to customer transection details


            // starting of customer to admin
            const admin = await collection.findOne({ role: 'admin' });
            if (!admin) {
                return res.status(400).json({ message: 'somtheing went wrong' })
            }
            const adminId=admin.number

            const adminWallet=await wallet.findOne({user_id:adminId});
            const adminOpening = adminWallet.amount;
            const filterAdmin = { user_id:adminId};
            const updateAdmin = { $inc: { amount: data.amount } };

            const resultAdmin = await wallet.findOneAndUpdate(filterAdmin, updateAdmin, { returnOriginal: true });
            const adminWalletAfter=await wallet.findOne({user_id:adminId});
            const adminClosing = adminWalletAfter.amount;
            
            const transectionInfo1 = {
                senderDetails: {

                    senderOpeningAmount:receverOpeningAmount,
                    senderCloseingAmount:receverCloseingAmount,
                    
                },
                receverDetails: {
                    receverOpeningAmount:adminOpening,
                    receverCloseingAmount:adminClosing
                },
                TransactionID,
                time,
                date,
                amount: transferAmount,
                senderId,
                receverId:adminId,
                type: 'emi paid'
            }

            const createTransactionHistroy1 = await transectionHistory.insertOne(transectionInfo1);

            if (!createTransactionHistroy1) {
                return res.status(400).json({ message: 'invalid request' })
            }
console.log(data)
            const emiCollection = db.collection('selldevice');
            const installmentId = data.installmentId;
            const loanId = data.loan_Id;
            const filter = {
                loanId: loanId,
                "installments.installmentId": installmentId
            };
            console.log('filter',filter)
            const update = {
                $set: {
                    "installments.$[elem].paid": true,
                    "installments.$[elem].payDate": getCurrentDate()
                }
            };
            const options = {
                arrayFilters: [{ "elem.installmentId": installmentId }],
                returnOriginal: false
            };


            const updatedEmi = await emiCollection.findOneAndUpdate(filter, update, options);

            if (!updatedEmi) {
                return res.status(400).json({ 'message': 'Invalid loan id or installment id' });
            }
            res.status(200).json({ message: 'emi paid succesfully' })

        });
    } catch (error) {
        res.status(400).json(error)
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

module.exports = { viewEmidetailsByNumber, payInstallment, viewPaidEmi }




