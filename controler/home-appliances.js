const { Collection } = require('mongoose');
const { getDB } = require('../dbconnection');
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const key = process.env.secretkey;
const tokenExpiry = '12h';



const addBrand = async (req, res) => {
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
            const collection = db.collection('homeAppliancesBrand');
            const data = req.body;

            if (!data.brandName1) {
                return res.status(400).json({ error: 'Bad Request: brandName1 is required' });
            }

            let brandName = data.brandName1.trim().toUpperCase();

            const existingBrand = await collection.findOne({ brandName: brandName });
            if (existingBrand) {
                return res.status(400).json({ error: 'Brand already added' });
            }

            const obj = {
                brandName: brandName,
                key: 'HomeAppliances', // Ensure 'brands' is defined somewhere in your code
                date: new Date()
            };

            const insert = await collection.insertOne(obj);
            if (!insert.acknowledged) {
                return res.status(500).json({ error: 'Something went wrong. Please try again' });
            }

            res.status(200).json({ message: 'Brand added successfully', data: insert });
        });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
};


const getAllData = async (req, res) => {
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
            const collection = db.collection('homeAppliancesBrand');
            const result = await collection.find({ key: 'HomeAppliances' }).toArray();
            res.status(200).json(result);

        });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}


const saveDevieInfo = async (req, res) => {
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
            const collection = db.collection('homeAppliancesBrand');
            const data = req.body;
            const brand = data.brand.trim().toUpperCase();
            const model = data.model.trim().toUpperCase();
            data.date = new Date();
            // Find if the brand and model already exist
            const existingBrand = await collection.findOne({ brand: brand, model: model });
            if (existingBrand) {
                return res.status(400).json({ message: 'Device All Ready Sold' });
            }

            const insert = await collection.insertOne(data);
            if (!insert) {
                return res.status(400).json({ message: 'Somtheing Went Wrong' });
            }
            res.status(200).json(insert);
        });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}


const getAllDevices = async (req, res) => {
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
            const collection = db.collection('homeAppliancesBrand');
console.log('devicesWithModel')
            // Find documents that have the key 'model'
            const devicesWithModel = await collection.find({ model: { $exists: true } }).toArray();
            console.log(devicesWithModel)
            return res.status(200).json(devicesWithModel);
        });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
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
        const collection = db.collection('homeAppliancesBrand');
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
        const collection = db.collection('homeAppliancesBrand');
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



const brandNames = async (req, res) => {
    try {
        const db = getDB();
        const collection = db.collection('homeAppliancesBrand');
        const result = await collection.find({ model: { $exists: true } }).project({ _id: 0, brand: 1, model: 1 }).toArray();
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
        const collection = db.collection('homeAppliancesBrand');


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

module.exports = { addBrand, getAllData,saveDevieInfo ,getAllDevices,deleteDevice,updateDevice,brandNames,deviceData}