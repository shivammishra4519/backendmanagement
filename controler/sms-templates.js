const { getDB } = require('../dbconnection');
const { templateObj } = require('../model/sms-template-model');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const key = process.env.secretkey;


const setTemplate = async (req, res) => {
    try {
        const data = req.body;
        const validationError = templateObj.validate(data);
        if (validationError.error) {
            return res.status(400).json(validationError.error);
        }
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
            if (!(role === 'admin')) {
                return res.status(400).json({ error: 'Unauthorized: user' })
            }

            const db = getDB();
            const collection = db.collection('smstemplates');
            const isPresent = await collection.findOne({ templateId: data.templateId });
            if (isPresent) {
                return res.status(400).json({ message: 'template allready exit' })
            }
            const result = await collection.insertOne(data);
            res.status(200).json({ message: 'success', data: result })


        });

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}


const viewTemplate = async (req, res) => {
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
            if (!(role === 'admin')) {
                return res.status(400).json({ error: 'Unauthorized: user' })
            }

            const db = getDB();
            const collection = db.collection('smstemplates');

            const find = await collection.find().toArray();

            if (!find) {
                return res.status(400).json({ message: 'invalid request' });
            }
            res.status(200).json(find)

        });

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}


const deleteTemplate = async (req, res) => {
    try {
        const id = req.body.templateId;
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
            if (!(role === 'admin')) {
                return res.status(400).json({ error: 'Unauthorized: user' })
            }

            const db = getDB();
            const collection = db.collection('smstemplates');

            const find = await collection.deleteOne({ templateId: id })

            if (!find) {
                return res.status(400).json({ message: 'invalid request' });
            }
            res.status(200).json(find)

        })
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}

const getTemplateByTemplateId = async (req, res) => {
    try {
        const type = req.body.type;
        const db = getDB();
        const collection = db.collection('smstemplates');
        const result=await collection.findOne({smsType:type})
        if(!result){
            return res.status(400).json({message:"invalid request"})
        }
        res.status(200).json(result)
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = { setTemplate, viewTemplate, deleteTemplate,getTemplateByTemplateId }