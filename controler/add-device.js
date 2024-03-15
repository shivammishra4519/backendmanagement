const { getDB } = require('../dbconnection');
const { deviceDetails, sellDeviceDetails } = require('../model/add-device-model');
const moment = require('moment');


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

        const result = await collection.find(query).toArray(); // Convert cursor to array

        return res.status(200).json(result); // Return the result array as JSON
    } catch (error) {
        return res.status(400).json(error); // Return any error as JSON
    }
};










module.exports = { addDevice, brandNames, deviceData, };