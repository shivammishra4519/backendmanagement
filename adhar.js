const axios = require('axios');
const { adharApiUrl, panApi, TokenID, ApiUserID, ApiPassword, adharVerfy } = require('./environment'); // Import environment variables

const express = require('express');
const bodyParser = require('body-parser');
const { getDB } = require('./dbconnection');
const bcrypt = require('bcryptjs');

const router = express.Router();

router.post('/sendOtp', async (req, res) => {
    try {
        const dataFromFront = req.body;
        console.log(dataFromFront)
        const url = adharApiUrl;
        const headers = {
            'Content-Type': 'application/json',
            'TokenID': TokenID,
            'ApiUserID': ApiUserID,
            'ApiPassword': ApiPassword
        };
        const data = {
            Aadhaarid: dataFromFront.Aadhaarid,
            ApiMode: '1'
        };

        const response = await axios.post(url, data, { headers: headers });
        console.log(response)
        const ref_id = response.data.response.ref_id;

        if (!ref_id) {
            return res.status(400).json({ messsage: 'somtheing went wrong1' });
        }
        const db = getDB()
        const collection = db.collection('otp');
        const result = await collection.findOne({ Aadhaarid: dataFromFront.Aadhaarid })
        if (result) {
            const deleteDocument = await collection.deleteOne({ Aadhaarid: dataFromFront.Aadhaarid });
        }

        response.data.response.Aadhaarid = dataFromFront.Aadhaarid

        const isInsertId = await collection.insertOne(response.data.response);
        if (!isInsertId) {
            return res.status(400).json({ messsage: 'somtheing went wrong3' });
        }
        console.log(response)
        res.status(response.status).json(response.data.response);
    } catch (error) {
        console.error('Error:', error);
        // Send error response back to client
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
}

)


router.post('/verify-otp', async (req, res) => {
    try {
        const dataFromFront = req.body;
        const url = adharVerfy;
        const headers = {
            'Content-Type': 'application/json',
            'TokenID': TokenID,
            'ApiUserID': ApiUserID,
            'ApiPassword': ApiPassword
        };
        console.log(dataFromFront)

        console.log(dataFromFront)
        const Aadhaarid = dataFromFront.Aadhaarid

        const db = getDB()
        const collection = db.collection('adharData');
        const otpCollection = db.collection('otp');
        const result = await otpCollection.findOne({ Aadhaarid: dataFromFront.Aadhaarid })
        if (!result) {
            return res.status(400).json({ messsage: "somtheing went wrong" });
        }
        const ref_id = result.ref_id;
        const data = {
            Aadhaarid: dataFromFront.Aadhaarid,
            OTP: dataFromFront.otp,
            ReqId: ref_id,
            ApiMode: '1'
        };
        const response = await axios.post(url, data, { headers: headers });
        console.log(response)
        const dataFromApi = response.data;
        const originalDate = response.data.response.dob;
        const name = response.data.response.name;
        const fatherName = response.data.response.care;
        let formattedDate
        let formatedFatherName
        if (originalDate) {
            const parts = originalDate.split('/');
            const onlyDate = parts[1];
            const date = parseInt(onlyDate);

            if (date < 10) {
                formattedDate = `${parts[2]}-0${parts[1]}-${parts[0]}`;
            }
            else {
                formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }

            const partsFatherName = fatherName.split(':'); // Split the string by ':'
            formatedFatherName = partsFatherName[1].trim();

        }

        dataFromApi.Aadhaarid = dataFromFront.Aadhaarid;
        const obj = {
            dob: formattedDate,
            name: name,
            father: formatedFatherName
        }
        if (!originalDate && !name && !fatherName) {
            return res.status(500).json({ error: 'somtheing went wrong' })
        }
        const isInsertId = await collection.insertOne(dataFromApi);

        res.status(200).json(obj);
    } catch (error) {
        console.error('Error:', error);
        // Send error response back to client
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
}

)




router.post('/verify-pan', async (req, res) => {
    try {
        const dataFromFront = req.body;
        const url = panApi;
        const headers = {
            'Content-Type': 'application/json',
            'TokenID': TokenID,
            'ApiUserID': ApiUserID,
            'ApiPassword': ApiPassword
        };
        const data = {
            Panid: dataFromFront.Panid,
            ApiMode: '1'
        };
        console.log(data)

        const response = await axios.post(url, data, { headers: headers });
        console.log(response)

        res.status(response.status).json(response.data.response);
    } catch (error) {
        console.error('Error:', error);
        // Send error response back to client
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
}

)




module.exports = router