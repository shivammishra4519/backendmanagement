const schedule = require('node-schedule');
const { getDB } = require('../dbconnection');
const environment = require('../environment')
const axios = require('axios');

// Define the function you want to run every month on the 6th at 2:00 PM
const myMonthlyFunction = async () => {
    try {
        const db = getDB();
        const collection = db.collection('selldevice');

        // Find all documents where currentCredit is greater than 0
        const result = await collection.find({ currentCredit: { $gt: 0 } }).toArray();

        for (const doc of result) {
            const installments = doc.installments;

            for (const emi of installments) {
                if (!emi.paid) {
                    // Extract the due date from the installment
                    const [day, month, year] = emi.dueDate.split('-').map(Number);
                    const dueDate = new Date(year, month - 1, day);

                    const currentDate = new Date();
                    const currentMonth = currentDate.getMonth();

                    currentDate.setHours(0, 0, 0, 0); // Set the current date to midnight for accurate comparison
                    if (month == currentMonth + 1) {
                        const smsTemplateCollection = db.collection('smstemplates');
                        const templateDoc = await smsTemplateCollection.findOne({ smsType: 'REMAINDER' });

                        if (!templateDoc) {
                            console.error('No SMS template found for type REMAINDER');
                            continue;
                        }

                        const template = templateDoc.template; // Ensure this is the string containing the template
                        if (typeof template !== 'string') {
                            console.error('SMS template is not a string:', template);
                            continue;
                        }

                        const values = [doc.customerName, doc.emiAmount, emi.dueDate];

                        const message = replacePlaceholders(template, values);

                        // sendsmsapi(message, doc.customerNumber);
                        sendSmsApiHindi(doc, doc.customerNumber, emi.dueDate);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error during the scheduled task:', error);
    }
};

// Schedule the job to run every 30 seconds
// schedule.scheduleJob('*/30 * * * * *', myMonthlyFunction);
schedule.scheduleJob('20 15 1-10 * *', myMonthlyFunction);

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Process terminated');
    process.exit(0);
});

function replacePlaceholders(template, values) {
    let index = 0;
    return template.replace(/{#var#}/g, () => {
        return values[index++];
    });
}

const sendsmsapi = async (sms, number) => {
    try {
        const db = getDB();
        const collection = db.collection('smstemplates');
        const template = await collection.findOne({ smsType: 'REMAINDER' });
        if (!template) {
            return 0;
        }

        const queryParams = new URLSearchParams({
            key: environment.key,
            campaign: environment.campaign,
            routeid: environment.routeid,
            type: environment.type,
            contacts: number,
            senderid: environment.senderid,
            msg: sms,
            template_id: template.templateId,
            pe_id: environment.pe_id
        });

        const url = `${environment.smsApiUrl}?${queryParams}`;

        // Send SMS
        const response = await axios.get(url);
        if (!response || response.status !== 200) {
            throw new Error('Failed to send SMS');
        }

        const inputString = response.data;
        const parts = inputString.split('/');

        // Extract the value
        const value = parts[1];

        const obj = {
            number: number,
            message: sms,
            date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
            time: new Date().toTimeString().split(' ')[0], // Current time in HH:MM:SS format
            smsShotId: value
        };
        const collectionSms = db.collection('sendedsms');
        const result2 = await collectionSms.insertOne(obj);
        if (!result2) {
            throw new Error('Failed to insert sent SMS record');
        }
    } catch (error) {
        console.error('Error sending SMS:', error);
    }
};





const sendSmsApiHindi = async (doc, number, dueDate) => {
    try {
        const db = getDB();
        const collection = db.collection('smstemplates');
        const template = await collection.findOne({ smsType: 'REMAINDER1' });
        console.log('temp',template)
        if (!template) {
            return 0;
        }
        const date = convertDate(dueDate);

        const value = [doc.brandName, doc.emiAmount, date, '500'];
        const temp = replacePlaceholders(template.template, value);
        console.log('ggg',temp)

        const apiurl = replaceUrlPlaceholdersApi(template.api, number, temp);
        axios.get(apiurl, {
        })
            .then(response => {
                // Handle the response
                response = response.data
                console.log('Response data:', response.data);
            })
            .catch(error => {
                // Handle any errors
                console.error('Error:', error);
            });

        const smsDetails = {
            number: data.number,
            message: data.sms,
            smsShotId: response || generateUniqueReadableNumber(),
            date: currentDate,
            time: time
        }
        console.log(smsDetails)
        const collection1 = db.collection('sendedsms');
        const result1 = await collection1.insertOne(smsDetails);
        if (!result1) {
            return res.status(400).json({ message: 'somtheing went wrong while save sms' })
        }
        return res.status(200).json({ message: 'success' })

    } catch (error) {

    }
}










function convertDate(dateString) {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // Split the date string
    const parts = dateString.split("-");
    const day = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1; // months are 0-based in JavaScript
    const year = parts[2];

    // Get the month name
    const monthName = monthNames[monthIndex];

    // Return the formatted date
    return monthName;
}






function replaceUrlPlaceholdersApi(url, phoneNumber, message) {
    return url.replace('mmmm', phoneNumber).replace('tttt', message);
}
