const { getDB } = require('../dbconnection');
const { getCurrentDate, getCurrentTime,generateUniqueReadableNumber } = require('./functions')
const jwt = require('jsonwebtoken');
require('dotenv').config();
const axios = require('axios');
const key = process.env.secretkey;
const tokenExpiry = '12h';
const saveSms = async (req, res) => {
    try {
        const data = req.body;
        const date = getCurrentDate();
        const time = getCurrentTime();
        data.date = date;
        data.time = time;
        const db = getDB();
        const collection = db.collection('sendedsms');
        const result = await collection.insertOne(data);
        if (!result) {
            return res.status(400).json({ message: 'somtheing went wrong' })
        }
        res.status(200).json(result)
    } catch (err) {
        return res.status(500).json({ 'message': 'Internal server error' });
    }
}


const getAllSms = async (req, res) => {
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
                const db = getDB();
                const collection = db.collection('sendedsms');

                // Fetch the latest 50 documents sorted by the most recent one first
                const result = await collection.find({})
                    .sort({ _id: -1 }) // Assuming _id is an ObjectId and contains the timestamp
                    .limit(50)
                    .toArray();

                if (!result || result.length === 0) {
                    return res.status(400).json({ message: 'No SMS found' });
                }

                return res.status(200).json(result);
            } catch (error) {
                return res.status(500).json({ message: 'Error retrieving SMS', error: error.message });
            }
        });

    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}



const addapi = async (req, res) => {
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
            if (!role == 'admin') {
                return res.status(400).json({ error: 'Unauthorized: request' })
            }
            const db = getDB();
            const collection = db.collection('apicollection');
            const data = req.body;
            const result = await collection.insertOne(data);
            if (!result) {
                return res.status(400).json({ message: 'Details not saved' })
            }
            res.status(200).json({ message: 'API saved Successfully' })

        });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}


const viewApi = async (req, res) => {
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
            if (!role == 'admin') {
                return res.status(400).json({ error: 'Unauthorized: request' })
            }
            const db = getDB();
            const collection = db.collection('apicollection');
            const data = req.body;
            const result = await collection.find().toArray();
            if (!result) {
                return res.status(400).json({ message: 'Details not found' })
            }
            res.status(200).json(result)

        });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}



const getTemplate = async (req, res) => {
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
            const collection = db.collection('smstemplates');
            const data = req.body;
            const result = await collection.findOne({ smsType: data.type });
            if (!result) {
                return res.status(400).json({ message: 'Details not found' })
            }
            res.status(200).json(result)
        });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}


const saveSmsDetails = async (req, res) => {
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
            const collection = db.collection('sendedsms');
            let data = req.body;
            const date = new Date();
            data.date = date.getDate();
            data.time = date.getTime();
            const result = await collection.insertOne(data);
            if (!result) {
                return res.status(400).json({ message: 'Data not seved' });
            }
            res.status(200).json(result)
        });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

const sendSms = async (req, res) => {
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
        //         return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        //     }

        const db = getDB();
        const collection = db.collection('apicollection');
        const data = req.body;
        const result = await collection.findOne({ apiType: data.type });
        if (!result) {
            return res.status(400).json({ message: 'Invalid type' });
        }
        let response;
        const date = new Date();
        const currentDate = getCurrentDate();
        const time = date.getTime();

        const api = replaceUrlPlaceholders(result.apiUrl, data.number, data.sms);

        axios.get(api, {
        })
            .then(response => {
                // Handle the response
                response = response.data
                console.log('Response data:', response.data);
            })
            .catch(error => {
                // Handle any errors
                console.error('Error:', error);
            });

        const smsDetails = {
            number: data.number,
            message: data.sms,
            smsShotId: response || generateUniqueReadableNumber(),
            date: currentDate,
            time: time
        }
        console.log(smsDetails)
        const collection1 = db.collection('sendedsms');
        const result1 = await collection1.insertOne(smsDetails);
        if (!result1) {
            return res.status(400).json({ message: 'somtheing went wrong while save sms' })
        }
        return res.status(200).json({ message: 'success' })
        // });

    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}


function replaceUrlPlaceholders(url, phoneNumber, message) {
    return url.replace('mmmm', phoneNumber).replace('tttt', message);
}




  // Get the current date
 
module.exports = { saveSms, getAllSms, addapi, viewApi, getTemplate, saveSmsDetails, sendSms }