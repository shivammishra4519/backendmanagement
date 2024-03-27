const { getDB } = require('../dbconnection');
const { deviceDetails, sellDeviceDetails } = require('../model/add-device-model');
const moment = require('moment');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const key = process.env.secretkey;
const tokenExpiry = '12h';


const addDevice = async (req, res) => {
    try {
        const data = req.body;
        const validationError = deviceDetails.validate(data);
        if (validationError.error) {
            res.status(400).json(validationError.error);
        }
        else {
            const db = getDB();
            const collection = db.collection('devices');
            const result1 = await collection.findOne({ model: data.model });
            if (result1) {
                res.status(400).json({ 'message': 'Device allready added' });
            }
            else {
                const result = await collection.insertOne(data);
                res.status(200).json(result);
            }

        }

    } catch (error) {
        res.status(400).json(error)
    }
}


const brandNames = async (req, res) => {
    try {
        const db = getDB();
        const collection = db.collection('devices');
        const result = await collection.find({}).project({ _id: 0, brand: 1, model: 1 }).toArray();
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json(error);
    }
}


const deviceData = async (req, res) => {
    try {
        const data = req.body;
        if (!data) {
            return res.status(400).json({ 'message': "Bad request" }); // Return early if request body is empty
        }

        const db = getDB();
        const collection = db.collection('devices');


        const query = {
            brand: data.brand,
            model: data.model
        };

        const result = await collection.findOne(query); // Convert cursor to array

        return res.status(200).json(result); // Return the result array as JSON
    } catch (error) {
        return res.status(400).json(error); // Return any error as JSON
    }
};



const viewAllDevice = async (req, res) => {
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
                return res.status(400).json({ message: 'invalid request' })
            }
            res.status(200).json(result);
        })
    } catch (error) {
        return res.status(400).json(error); // Return any error as JSON
    }
}







module.exports = { addDevice, brandNames, deviceData, viewAllDevice};