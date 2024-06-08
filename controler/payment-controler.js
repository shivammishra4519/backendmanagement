const { getDB } = require('../dbconnection')
const jwt = require('jsonwebtoken');
const key = process.env.secretkey;
const axios = require('axios')

const onlinePaymentsRequest = async (req, res) => {
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
            const collection = db.collection('onlinePayments');
            const result = await collection.find().toArray();
            res.status(200).json({ result })
        });
    } catch (error) {
        return res.status(500).json({ message: 'internal server error' })
    }
}

const checkPaymentStatus = async (req, res) => {
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
            const response = await checkOrderStatus(data.order_id);
            if (response.status == 'COMPLETED') {
                return res.status(200).json(response);
            }
            res.status(400).json({ message: 'Payemnt not recevied' })
        });
    } catch (error) {
        return res.status(500).json({ message: 'internal server error' })
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

const checkUtrIsExit = async (req, res) => {
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
            const db = getDB();
            const collection = db.collection('emiPaidHistory');
            const result=await collection.findOne({utr:data.utr});
            if(result){
                return res.status(200).json(result)
            }
            res.status(200).json(null);
        });
    } catch (error) {
        return res.status(500).json({ message: 'internal server error' })
    }
}
module.exports = { onlinePaymentsRequest, checkPaymentStatus,checkUtrIsExit };