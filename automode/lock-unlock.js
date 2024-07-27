const schedule = require('node-schedule');
const axios = require('axios');
const { getDB } = require('../dbconnection');
const url = process.env.zte;

// Define the function you want to run every minute
const myMinuteFunction = async () => {
    try {
        const db = getDB();
        const collection = db.collection('selldevice');

        const result = await collection.find({ currentCredit: { $gt: 0 } }).toArray();
        console.log("1222")
        for (const doc of result) {
            const installments = doc.installments;
            for (const emi of installments) {
                if (!emi.paid) {

                    const dueDate = emi.dueDate;
                    // Your date string
                    const [day, month, year] = dueDate.split('-');
                    let currentMonth = new Date().getMonth();
                    const currentDate=new Date().getDate();
                    currentMonth = currentMonth + 1;
                   
                    if (month <= currentMonth && currentDate > 5) {

                        const isFromZte = doc.loanKey; // Correctly access doc.loanKey
                        if (isFromZte) {

                            const response = await lockDevice(isFromZte);
                            console.log(`Lock device response for ${isFromZte}:`, response);
                        }

                    }
                }
            }

        }


    } catch (error) {
        console.error('Error during the scheduled task:', error);
    }
};

// Schedule the job to run every minute
schedule.scheduleJob('30 8 * * *', myMinuteFunction);


// Schedule the job to run at 12:00 PM (noon)
schedule.scheduleJob('0 12 * * *', myMinuteFunction);

// Schedule the job to run at 6:00 PM
// schedule.scheduleJob('0 18 * * *', myMinuteFunction);
schedule.scheduleJob('* * * * *', myMinuteFunction);

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Process terminated');
    process.exit(0);
});

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
        'theStatus': '1'
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
