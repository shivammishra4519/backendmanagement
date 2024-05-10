const { getDB } = require('../dbconnection');
const { deviceDetails, sellDeviceDetails } = require('../model/add-device-model');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb')
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



const viewDeviceByCustomerId = async (req, res) => {
    try {
        const data = req.body;
        const db = getDB();
        console.log(data)
        const collection = db.collection('selldevice');
        const result = await collection.findOne({ customerNumber: parseInt(data.number) });
        if (result) {
            return res.status(200).json(result);
        }
        res.status(400).json({ message: 'data not found' })

    } catch (error) {
        return res.status(400).json(error); // Return any error as JSON
    }
}


const deleteDevice = async (req, res) => {
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
        const data = req.body;
        const id = new ObjectId(data._id);

        try {
            const result = await collection.findOneAndDelete({ _id: id });
          
            if (!result) {
                return res.status(404).json({ error: 'Device not found' });
            }
            return res.status(200).json({ message: 'Device deleted successfully' });
        } catch (error) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    });
}

const updateDevice = async (req, res) => {
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
        const data = req.body;
        const id = new ObjectId(data._id);

        try {
            const filter = { _id: id };
            delete data._id
            const update = { $set: data }; // Assuming `data` contains updated device fields
            const result1=await collection.findOne(filter)
            const result = await collection.updateOne(filter, update);
            if (result.modifiedCount === 0) {
                return res.status(404).json({ error: 'Device not found or no changes made' });
            }

            return res.status(200).json({ message: 'Device updated successfully' });
        } catch (error) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    });
}




module.exports = { addDevice, brandNames, deviceData, viewAllDevice, viewDeviceByCustomerId,deleteDevice,updateDevice };