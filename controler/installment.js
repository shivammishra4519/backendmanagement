const { getDB } = require('../dbconnection');
const jwt = require('jsonwebtoken');
const { generateTransactionID, createTransactionHistroy } = require('../controler/sell-device')
const axios = require('axios');
require('dotenv').config();
const frontEndUrl = process.env.frontEnd;
const url = process.env.zte;
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
        const loanId = data.loanId;
        let result
        if (number) {
            result = await collection.findOne({ customerNumber: number });
        }
        if (loanId) {
            result = await collection.findOne({ loanId: loanId });
        }

        if (!result) {
            return res.status(400).json({ message: 'invalid user id' })
        }

        res.status(200).json(result)


    } catch (error) {
        res.status(400).json(error)
    }
};


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
            const role = decodedToken.role;

            const db = getDB();
            const wallet = db.collection('wallets');
            const collection = db.collection('users');
            const emiCollection = db.collection('selldevice');
            const loanWallet = db.collection('loanwallets');
            const dailyCollection = db.collection('dailyCollection')


            // checking balance of employee
            if (role == 'admin') {
                return res.status(400).json({ message: 'invalid request' })
            }


            const balanceCheck = await wallet.findOne({ user_id: employeId });
            if (!balanceCheck)
                return res.status(400).json({ message: 'Something went wrong with employer balance check' });

            if (balanceCheck.amount < data.amount) {
                return res.status(400).json({ message: 'Insufficient balance' });
            }

            const result = await collection.findOne({ number: employeId });
            const dbPin = result.pin;
            const isPinMatched = (dbPin == data.pin);

            if (!isPinMatched)
                return res.status(400).json({ message: 'Incorrect PIN' });

            // checking loan wallet
            const customerCheck = await loanWallet.findOne({ loanId: data.loan_Id });

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
            if (paid) {
                return res.status(400).json({ message: 'EMI already paid' });
            }



            let senderClosingAmount;
            let receiverClosingAmount;
            const senderOpeningAmount = balanceCheck.amount;
            const receiverOpeningAmount = customerCheck.credit;

            const senderFilter = { user_id: employeId };
            const receiverFilter = { loanId: data.loan_Id };

            const updateSender = { $inc: { amount: -data.amount } };
            const updateReceiver = { $inc: { credit: -data.amount } };

            const result1 = await wallet.findOneAndUpdate(senderFilter, updateSender, { returnOriginal: false });
            const result2 = await loanWallet.findOneAndUpdate(receiverFilter, updateReceiver, { returnOriginal: false });
            const amountCheckAfterCustomer = await loanWallet.findOne(receiverFilter);

            const amountCheckAfterEmployee = await wallet.findOne(senderFilter);

            senderClosingAmount = amountCheckAfterEmployee.amount;
            receiverClosingAmount = amountCheckAfterCustomer.credit;

            // Record transaction history
            const transactionHistory = db.collection('emipaidhistory');

            const transactionInfo = {
                senderDetails: { senderOpeningAmount, senderClosingAmount },
                receiverDetails: { receiverOpeningAmount, receiverClosingAmount },
                TransactionID: generateTransactionID(),
                time: getCurrentTime(),
                date: getCurrentDate(),
                amount: data.amount,
                senderId: decodedToken.number,
                receiverId: parseInt(data.user_id),
                type: 'emiPaid',
                type1: 'emToCs'
            };

            const createTransactionHistory = await transactionHistory.insertOne(transactionInfo);
            if (!createTransactionHistory)
                return res.status(400).json({ message: 'Failed to record transaction history' });




            const payDate = getCurrentDate();

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

            emiCollection.updateOne(
                { loanId: data.loan_Id }, // Filter criteria
                { $set: { currentCredit: receiverClosingAmount } } // Update operation using $set
            );


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
            const adminWalletCheckAfter = await wallet.findOne(adminFilter);

            const adminClosing = adminWalletCheckAfter.amount;

            const adminTransactionInfo = {
                senderDetails: {
                    senderOpeningAmount: customerCheck.credit,
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
                type: 'emiPaid',
                type1: 'toAdmin'
            };

            const createAdminTransaction = await transactionHistory.insertOne(adminTransactionInfo);
            data.employeeId = decodedToken.number;
            data.date = getCurrentDate();
            data.time = getCurrentTime();
            const emiPaidCollection = db.collection('emiPaidHistory');
            const isInsert = await emiPaidCollection.insertOne(data);

            if (role == 'employee') {
                const obj = {
                    user_id: decodedToken.number,
                    amount: data.amount
                };

                const find = await dailyCollection.findOne({ user_id: decodedToken.number });

                if (!find) {
                    // If user does not exist, insert a new document
                    await dailyCollection.insertOne(obj);
                } else {
                    // If user exists, update the existing document to add the new amount
                    const newAmount = find.amount + data.amount;
                    await dailyCollection.updateOne(
                        { user_id: decodedToken.number },
                        { $inc: { amount: data.amount } }
                    );
                }


            }

            if (!createAdminTransaction)
                return res.status(400).json({ message: 'Failed to record admin transaction' });

            const zteKey = await emiCollection.findOne({ loanId: data.loan_Id });
            if (zteKey.loanKey) {
                const lockStatus = await lockDevice(zteKey.loanKey);
                console.log("Lock status", lockStatus);
            }
           await sendSmsEmiPaid(zteKey,data.amount,data.installmentId);
            res.status(200).json({ message: 'EMI paid successfully' });
        });
    } catch (error) {
        res.status(400).json({ message: 'Internal server error', error });
    }
}




const viewPaidEmi = async (req, res) => {
    try {

        const authHeader = req.headers['authorization'];

        if (!authHeader)
            return res.status(401).json({ message: 'Unauthorized: Authorization header missing' });

        const token = authHeader.split(' ')[1];
        if (!token)
            return res.status(401).json({ message: 'Unauthorized: Token missing' });

        jwt.verify(token, key, async (err, decodedToken) => {
            if (err)
                return res.status(401).json({ message: 'Unauthorized: Invalid token' });
            const number = decodedToken.number;
            const db = getDB();
            const collection = db.collection('transectiondetails');
            const query = {
                type: ['emiPaid', 'emi paid'], // Array containing multiple values for the 'type' key
                $or: [
                    { senderId: number },

                ]
            };


            const result = await collection.find(query).toArray();
            res.status(200).json(result);

        });
    } catch (error) {
        res.status(400).json(error)
    }
}


const findInstallmentByloanId = async (req, res) => {
    const db = getDB();
    const collection = db.collection('selldevice');
    const data = req.body;


    if (!data || !data.loanId) {
        return res.status(400).json({ message: 'Loan ID not provided' });
    }
    try {
        const result = await collection.findOne({ loanId: data.loanId });
        if (!result) {
            return res.status(404).json({ message: 'Loan not found' });
        }
        const installment = result.installments.find(installment => installment.installmentId === data.emiId);
        if (!installment) {
            return res.status(404).json({ message: 'Installment not found' });
        }

        // Do something with the installment data
        res.status(200).json(result);
    } catch (error) {

        res.status(500).json({ message: 'Internal server error' });
    }
}


const viewAllemi = async (req, res) => {
    try {

        const authHeader = req.headers['authorization'];

        if (!authHeader)
            return res.status(401).json({ message: 'Unauthorized: Authorization header missing' });

        const token = authHeader.split(' ')[1];
        if (!token)
            return res.status(401).json({ message: 'Unauthorized: Token missing' });

        jwt.verify(token, key, async (err, decodedToken) => {
            if (err) {
                return res.status(401).json({ message: 'Unauthorized: Invalid token' });
            }
            const number = decodedToken.number;
            const role = decodedToken.role;
            const db = getDB();
            const collection = db.collection('emipaidhistory');
            if (role == 'admin') {
                const result = await collection.find({ type1: 'emToCs' }).toArray();
                if (result) {
                    return res.status(200).json(result);
                }

                return res.status(400).json({ message: 'data not found' })
            }
            const result = await collection.find({ senderId: number }).toArray();
            if (result) {
                return res.status(200).json(result);
            }
            res.status(400).json({ message: 'data not found' })

        });



    } catch (error) {

        res.status(500).json({ message: 'Internal server error' });
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




const lockDevice = async (key) => {
    const headers = {
        'Accept': '*/*',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Cookie': 'PHPSESSID=bq8b53su087ao76vsft79778k6',
        'Referer': 'https://ztesolutions.com/adminpanel/viewCustomersDetails.php?ozoCode=11SKYCCMKE',
        'User-Agent': 'Mozilla/5.0'
    };

    const formData = new URLSearchParams({
        'ozoCode': key,
        'theStatus': '0'
    }).toString();

    try {
        const response = await axios.post(url, formData, { headers });
        console.log('Device unlocked successfully:', response.data);
        return 1;
    } catch (error) {
        console.error('Error locking device:', error);
        return 0;
    }
};

const viewPaidEmiForAdmin = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];

        if (!authHeader)
            return res.status(401).json({ message: 'Unauthorized: Authorization header missing' });

        const token = authHeader.split(' ')[1];
        if (!token)
            return res.status(401).json({ message: 'Unauthorized: Token missing' });

        jwt.verify(token, key, async (err, decodedToken) => {
            if (err) {
                return res.status(401).json({ message: 'Unauthorized: Invalid token' });
            }
            const number = decodedToken.number;
            const role = decodedToken.role;
            const db = getDB();
            const collection = db.collection('emiPaidHistory');
            if (!role == 'admin') {
                return res.status(400).json({ message: 'Unauthorized:  Request' })
            }
            const result = await collection.find().toArray();

            res.status(200).json(result)

        });

    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
}



const payInstallmentOnline = async (req, res) => {
    try {
        const data = req.body;
        const db = getDB();
        const collection = db.collection('selldevice');
        const result = await collection.findOne({ loanId: data.loanId });

        if (!result) {
            return res.status(200).json({ message: 'No loan Found with These details' });
        }

        const axios = require('axios');
        const ordId = '123456' + Date.now();
        const dataToSend = {
            order_id: ordId,
        };

        const encodedData = Buffer.from(JSON.stringify(dataToSend)).toString('base64');

        const url = 'https://mobilefinder.store/api/create-order';
        const data1 = {
            customer_mobile: result.customerNumber,
            user_token: '099f942cc0163b93025ed62655f4aed1',
            amount: result.emiAmount,
            order_id: ordId,
            redirect_url: `${frontEndUrl}/payment-success?data=${encodedData}`,
            remark1: data.loanId,
            remark2: data.installmentId,
        };

        const response = await axios.post(url, data1);


        const responseString = response.data;

        const onlinePaymentCollection = db.collection('onlinePayments');
        console.log(response)

        // Extract JSON part from the response string
        const parts = responseString.split(')'); // Assuming the response ends with a closing parenthesis ')'
        const jsonString = parts[parts.length - 1].trim(); // Get the last part and trim whitespace

        try {
            const jsonResponse = JSON.parse(jsonString);
            const paymentUrl = jsonResponse.result.payment_url;
            const insertDetails = await onlinePaymentCollection.findOne({ order_id: data1.order_id });
            if (insertDetails) {
                return res.status(400).json({ message: 'Order Id already exit' })
            }
            data1.date = new Date()
            await onlinePaymentCollection.insertOne(data1);
            res.status(200).json({ status: true, paymentUrl });
        } catch (error) {

            res.status(500).json({ status: false, message: 'Failed to parse JSON response' });
        }
    } catch (error) {

        res.status(500).json({ message: 'Internal server error' });
    }
};






const updateInstallmentPayOnline = async (req, res) => {
    try {

        const db = getDB();
        const collection = db.collection('onlinePayments');
        const wallet = db.collection('wallets');
        const usersCollection = db.collection('users');
        const emiCollection = db.collection('selldevice');
        const loanWallet = db.collection('loanwallets');

        const data = req.body;
        // Check if order status is completed

        const response = await checkOrderStatus(data.order_id);
        if (!response.status == 'COMPLETED') {
            return res.status(400).json({ message: 'Payment not received' });
        }

        // Find payment record
        const result = await collection.findOne({ order_id: data.order_id });
        if (!result) {
            return res.status(400).json({ message: 'Invalid OrderId' });
        }

        // Find loan details
        const loanDetails = await emiCollection.findOne({ loanId: result.remark1 });
        if (!loanDetails) {
            return res.status(400).json({ message: 'Invalid loan request: loan not found' });
        }

        // Check if installment is already paid
        const isAlreadyPaid = await emiCollection.findOne({
            loanId: loanDetails.loanId,
            "installments.installmentId": result.remark2
        });


        if (!isAlreadyPaid) {
            return res.status(400).json({ message: 'Invalid loan ID or installment ID' });
        }
        const installments = isAlreadyPaid.installments;
        const obj = installments.find(installment => installment.installmentId === result.remark2);
        const paid = obj.paid;

        if (paid) {
            console.log(data)
            return res.status(400).json({ message: 'EMI already paid' });
        }

        // Update installment payment status
        const filter = {
            loanId: loanDetails.loanId,
            "installments.installmentId": result.remark2
        };
        const update = {
            $set: {
                "installments.$[elem].paid": true,
                "installments.$[elem].payDate": new Date()
            }
        };

        const options = {
            arrayFilters: [{ "elem.installmentId": result.remark2 }],
            returnOriginal: false
        };
        const updatedEmi = await emiCollection.findOneAndUpdate(filter, update, options);

        // Update loan and wallet balances
        const amount = parseInt(result.amount);
        await loanWallet.findOneAndUpdate({ loanId: loanDetails.loanId }, { $inc: { credit: -amount } });
        await wallet.findOneAndUpdate({ user_id: loanDetails.customerNumber }, { $inc: { amount } });

        // Record transaction history
        const adminId = await usersCollection.findOne({ role: 'admin' });
        if (!adminId) {
            return res.status(400).json({ message: 'Technical issue' });
        }
        const adminWallet = await wallet.findOne({ user_id: adminId.number });
        const adminOpening = adminWallet.amount;
        const adminUpdate = { $inc: { amount: amount } };
        await wallet.findOneAndUpdate({ user_id: adminId.number }, adminUpdate);

        // Record transaction history
        const adminClosing = (await wallet.findOne({ user_id: adminId.number })).amount;





        // Record EMI paid history
        const paymentFormData = {
            user_id: loanDetails.customerNumber,
            loan_Id: loanDetails.loanId,
            installmentId: result.remark2,
            utr: response.result.utr,
            paymentBy: 'self',
            paymentMod: 'online',
            amount: amount,
            date: getCurrentDate(),
            time: getCurrentTime(),
            employeeId:'paymentGatway'
        };
        const emiPaidCollection = db.collection('emiPaidHistory');
        await emiPaidCollection.insertOne(paymentFormData);

        // Update current credit
        const res1 = await emiCollection.findOneAndUpdate({ loanId: loanDetails.loanId }, { $inc: { currentCredit: -amount } });

        const receiverClosingAmount = await emiCollection.findOne({ loanId: loanDetails.loanId })
        const adminTransactionInfo = {
            senderDetails: {
                senderOpeningAmount: loanDetails.currentCredit,
                senderClosingAmount: receiverClosingAmount.currentCredit
            },
            receiverDetails: {
                receiverOpeningAmount: adminOpening,
                receiverClosingAmount: adminClosing
            },
            TransactionID: generateTransactionID(),
            time: getCurrentTime(),
            date: getCurrentDate(),
            amount: loanDetails.emiAmount,
            senderId: loanDetails.customerNumber,
            receiverId: adminId.number,
            type: 'emiPaid',
            type1: 'toAdmin'
        };
        const transactionHistory = db.collection('emipaidhistory');
        await transactionHistory.insertOne(adminTransactionInfo);
        if (res1) {
            const zteKey = await emiCollection.findOne({ loanId: loanDetails.loanId });
            if (zteKey.loanKey) {
                const lockStatus = await lockDevice(zteKey.loanKey);
            }
        }

        await sendSmsEmiPaid(loanDetails, result.amount,result.remark2);
        res.status(200).json({ message: 'EMI paid successfully' });


    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}





async function checkOrderStatus(order_id) {
    const url = 'https://mobilefinder.store/api/check-order-status';
    const data1 = {
        "user_token": "099f942cc0163b93025ed62655f4aed1",
        "order_id": order_id
    };

    try {
        const response = await axios.post(url, data1);
        const responseString = response.data;
        return responseString
    } catch (error) {
        console.error('Error occurred while making the request:', error);
    }
}




 // Adjust the path according to your project structure

const sendSmsEmiPaid = async (data, amount, emiId) => {
    try {
        const db = getDB();
        const collection = db.collection('smstemplates');
        const result = await collection.findOne({ smsType: 'EMI_PAID1' });
        if (!result) {
            return 0;
        }
        const template = result.template;
        const apiurl = process.env.apiUrl;
        const link = `${apiurl}pdf/installment-slip?loanId=${encodeURIComponent(data.loanId)}&emiId=${encodeURIComponent(emiId)}`;
       
        const values = [data.customerName, amount, `${data.brandName} ${data.modelName}`, getCurrentDate(), link];
        const modfiyedTemplate = replacePlaceholders(template, values);
        
        const encodedMessage = encodeURIComponent(modfiyedTemplate);
        const encodedPhoneNumber = encodeURIComponent(data.customerNumber);
        const url = replaceUrlPlaceholdersApi(result.api, encodedPhoneNumber, encodedMessage);
        console.log('url', url);
        
        let response;
        try {
            const res = await axios.get(url);
            response = res.data;
            console.log('Response data:', response);
        } catch (error) {
            console.error('Error:', error);
            response = 'msg not sent';
        }

        const smsDetails = {
            number: data.customerNumber,
            message: modfiyedTemplate,
            smsShotId: response || 'msg sent',
            date: getCurrentDate(),
            time: getCurrentTime()
        };

        const collection1 = db.collection('sendedsms');
        const result1 = await collection1.insertOne(smsDetails);
        if (!result1) {
            return 0;
        }
        return 1;
    } catch (error) {
        console.error('Error occurred while making the request:', error);
        return 0;
    }
};

module.exports = { sendSmsEmiPaid };


function replacePlaceholders(template, values) {
    let index = 0;
    return template.replace(/{#var#}/g, () => {
        return values[index++];
    });
}


function replaceUrlPlaceholdersApi(url, phoneNumber, message) {
    return url.replace('mmmm', phoneNumber).replace('tttt', message);
}
module.exports = { viewEmidetailsByNumber, payInstallment, viewPaidEmi, findInstallmentByloanId, viewAllemi, viewPaidEmiForAdmin, payInstallmentOnline, updateInstallmentPayOnline }




