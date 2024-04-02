const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
require('dotenv').config();
const PaytmChecksum = require('paytmchecksum');

const router = express.Router();

router.use(bodyParser.json());

router.post('/initiatePayment', (req, res) => {
    const merchantId = process.env.MERCHANT_ID;
    const merchantKey = process.env.MERCHANT_KEY;
    const website = process.env.WEBSITE;
    const callbackUrl = process.env.CALLBACK_URL;
    const industryType = 'Retail'; // Set the industry type
    const channelId = 'WEB'; // Set the channel ID for website

    // Generate a unique order ID for each transaction
    const orderId = 'ORDER_' + new Date().getTime();

    // Construct the request parameters
    const paytmParams = {
        body: {
            "requestType": "Payment",
            "mid": merchantId,
            "websiteName": website,
            "orderId": orderId,
            "callbackUrl": callbackUrl,
            "txnAmount": {
                "value": "1.00",
                "currency": "INR",
            },
            "userInfo": {
                "custId": "CUST_001",
            },
            "industryType": industryType, // Include the industry type
            "channelId": channelId, // Include the channel ID
        }
    };

    // Generate signature for secure communication
    PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), merchantKey)
    .then(checksum => {
        // Include the signature in the request parameters
        paytmParams.head = {
            "signature": checksum
        };

        // Prepare the request data
        const post_data = JSON.stringify(paytmParams);

        // Set up the HTTPS request options
        const options = {
            hostname: 'securegw-stage.paytm.in',
            port: 443,
            path: '/theia/api/v1/initiateTransaction?mid=' + merchantId + '&orderId=' + orderId,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': post_data.length
            }
        };

        // Make the HTTPS request
        const post_req = https.request(options, function (post_res) {
            let response = '';
            post_res.on('data', function (chunk) {
                response += chunk;
            });

            post_res.on('end', function () {
                // Send the response back to the client
                res.send(response);
            });
        });

        // Handle errors in the HTTPS request
        post_req.on('error', function (error) {
            console.error("Error in HTTPS request:", error);
            res.status(500).send("Error in HTTPS request");
        });

        // Write the request data and end the request
        post_req.write(post_data);
        post_req.end();
    })
    .catch(function (error) {
        console.error("Error generating checksum:", error);
        res.status(500).send("Error generating checksum");
    });
});

module.exports = router;
