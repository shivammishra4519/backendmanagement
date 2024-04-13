const express = require('express');
const bodyParser = require('body-parser');
const { getDB } = require('./dbconnection');
const bcrypt = require('bcryptjs');
const environment = require('./environment')
const axios = require('axios');

const router = express.Router();


router.use(bodyParser.json());



router.post('/send-otp', async (req, res) => {
  try {
    const dataFrom = req.body; // Assuming you're using Express.js to parse the request body
    if (!dataFrom || !dataFrom.number || !dataFrom.type) {
      return res.status(400).json({ message: 'Invalid request data' });
    }

    const db = getDB();
    const collection1 = db.collection('otp');
    const collection = db.collection('smstemplates');

    // Check if OTP already exists for the number and delete it
    const existingOTP = await collection1.findOne({ number: dataFrom.number });
    if (existingOTP) {
      await collection1.deleteOne({ number: dataFrom.number });
    }

    // Find SMS template based on type
    const result = await collection.findOne({ smsType: dataFrom.type });
    if (!result) {
      return res.status(400).json({ message: 'Invalid SMS type' });
    }

    // Generate OTP and create message
    const otp = generateOTP();
    const message = result.template.replace("{#var#}", otp);

    // Prepare data for SMS API
    const smsData = {
      contact: dataFrom.number,
      msg: message,
      template_id: result.templateId
    };


    const date = getCurrentDate();
    const time1 = getCurrentTime();



    // Construct URL with query parameters
    const queryParams = new URLSearchParams({
      key: environment.key,
      campaign: environment.campaign,
      routeid: environment.routeid,
      type: environment.type,
      contacts: smsData.contact,
      senderid: environment.senderid,
      msg: smsData.msg,
      template_id: smsData.template_id,
      pe_id: environment.pe_id
    });
    const url = `${environment.smsApiUrl}?${queryParams}`;

    // Send SMS
    const response = await axios.get(url);
    if (!response || response.status !== 200) {
      throw new Error('Failed to send SMS');
    };

  
    const inputString = response.data;

    const parts = inputString.split('/');

    // Extract the value
    const value = parts[1];

    const obj = {
      number: dataFrom.number,
      message: message,
      date: date,
      time: time1,
      smsShotId:value
    }
    const collectionSms = db.collection('sendedsms');
    const result2 = await collectionSms.insertOne(obj);
    if (!result2) {
      return res.status(400).json({ message: 'somtheing went wrong' })
    }


    // Save OTP to database
    const time = Date.now();
    const otpObject = {
      number: dataFrom.number,
      otp: otp,
      time: time,
      expireTime: '5' // Assuming you want to expire OTP after 5 minutes
    };



    const insertedId = await collection1.insertOne(otpObject);
    if (!insertedId) {
      throw new Error('Failed to save OTP');
    }

    // Send success response
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.post('/verify-otp', async (req, res) => {
  try {
    const { otp, number } = req.body;
 
    const db = getDB();
    const collection = db.collection('otp');
    const result = await collection.findOne({ number: number });

    if (!result) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    const currentTime = Date.now();
    const storedTimestamp = result.time;
    const timeDifference = currentTime - storedTimestamp;
    const timeThreshold = 5 * 60 * 1000; // 5 minutes in milliseconds

    if (timeDifference <= timeThreshold) {
      const match = (otp==result.otp);
      if (match) {
        // OTP is valid
        const date = await collection.deleteOne({ number: number });
        return res.status(200).json({ message: 'OTP is valid' });
      } else {
        // Invalid OTP
        return res.status(400).json({ message: 'Invalid OTP' });
      }
    } else {
      // OTP has expired
      return res.status(400).json({ message: 'OTP has expired' });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});




function generateOTP() {
  const digits = '0123456789';
  let otp = '';
  const length = 6
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * digits.length);
    otp += digits[randomIndex];
  }

  return otp;
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
  // Get current date
  const currentDate = new Date();

  // Extract day, month, and year
  const day = currentDate.getDate().toString().padStart(2, '0');
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Note: Months are zero-based
  const year = currentDate.getFullYear();

  // Create the date string in the format dd-mm-yyyy
  const formattedDate = `${day}-${month}-${year}`;

  return formattedDate;
}


// function for sending msg



module.exports = router;
