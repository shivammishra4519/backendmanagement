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
                        console.log('jj', values);
                        const message = replacePlaceholders(template, values);
                        console.log('temp', message);
                        sendsmsapi(message, doc.customerNumber);
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
schedule.scheduleJob('50 13 1-10 * *', myMonthlyFunction);

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
        console.log(queryParams)
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
