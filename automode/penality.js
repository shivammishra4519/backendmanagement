const schedule = require('node-schedule');
const { getDB } = require('../dbconnection');

// Define the function you want to run every month on the 6th at 2:00 PM
const myMonthlyFunction = async () => {
    try {
        const db = getDB();
        const collection = db.collection('selldevice');
        const penalityCollection = db.collection('penality');
        
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
                    currentDate.setHours(0, 0, 0, 0); // Set the current date to midnight for accurate comparison
                    
                    // Check if the due date has passed
                    if (dueDate < currentDate) {
                        // Check if a penalty has already been added for this EMI and loan
                        const existingPenalty = await penalityCollection.findOne({
                            loanId: doc.loanId,
                            penalityFor: emi.installmentId
                        });

                        if (!existingPenalty) {
                            const filterLoan = { loanId: doc.loanId };
                            const updateLoan = { $inc: { penality: 500 } };

                            // Update the loan document to add the penalty
                            const result = await collection.findOneAndUpdate(filterLoan, updateLoan, { returnOriginal: false });

                            // Create a penalty history record
                            const obj = {
                                amount: 500,
                                date: new Date(),
                                penalityFor: emi.installmentId,
                                emiDueDate: emi.dueDate,
                                loanId: doc.loanId
                            };

                            const insert = await penalityCollection.insertOne(obj);
                            
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error during the scheduled task:', error);
    }
};

// Schedule the job to run on the 6th of every month at 2:00 PM
schedule.scheduleJob('* * 6 * *', myMonthlyFunction);

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Process terminated');
    process.exit(0);
});
