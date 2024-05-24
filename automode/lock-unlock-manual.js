const { getDB } = require('../dbconnection');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const axios = require('axios');
const key = process.env.secretkey;
const url = process.env.zte;
const unlockDevice=async(req,res)=>{
    try {
        const loanKey=req.body.key;
        const headers = {
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Content-Length': '30',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Cookie': 'PHPSESSID=bq8b53su087ao76vsft79778k6',
            'Host': 'ztesolutions.com',
            'Origin': 'https://ztesolutions.com',
            'Pragma': 'no-cache',
            'Referer': 'https://ztesolutions.com/adminpanel/viewCustomersDetails.php?ozoCode=11SKYCCMKE',
            'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'X-Requested-With': 'XMLHttpRequest'
        };
    
        // Define the form data
        const formData = new URLSearchParams({
            'ozoCode': loanKey,
            'theStatus': '0'
        }).toString();
    
        try {
            const response = await axios.post(url, formData, { headers });
            console.log('Device locked successfully:', response.data);
            return 1;
        } catch (error) {
            console.error('Error locking device:', error);
            return 0;
        }
    } catch (error) {
        return res.status(500).json({ 'message': 'Internal server error' });
    }
}




// Lock Device Function
const lockDevice = async (key) => {
    const headers = {
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Content-Length': '30',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Cookie': 'PHPSESSID=bq8b53su087ao76vsft79778k6',
        'Host': 'ztesolutions.com',
        'Origin': 'https://ztesolutions.com',
        'Pragma': 'no-cache',
        'Referer': 'https://ztesolutions.com/adminpanel/viewCustomersDetails.php?ozoCode=11SKYCCMKE',
        'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'X-Requested-With': 'XMLHttpRequest'
    };

    // Define the form data
    const formData = new URLSearchParams({
        'ozoCode': key,
        'theStatus': '0'
    }).toString();

    try {
        const response = await axios.post(url, formData, { headers });
        console.log('Device locked successfully:', response.data);
        return 1;
    } catch (error) {
        console.error('Error locking device:', error);
        return 0;
    }
}
module.exports={unlockDevice,lockDevice}