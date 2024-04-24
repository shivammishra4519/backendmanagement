const { getDB } = require('../dbconnection');
const jwt = require('jsonwebtoken');
const Excel = require('exceljs');

const path = require('path');

const exportDataInExcel = async (req, res) => {
    try {
        const db = getDB();
        const collection = db.collection('selldevice');
        const collection1 = db.collection('dummy');
        await collection1.deleteMany({});
        const result = await collection.find({}, { customerNumber: 1, _id: 0 }).toArray();

        for (const item of result) {
            // Remove the _id field from the item object
            delete item._id;

            const newObj = {
                Date: item.purchaseDate,
                loanId: item.loanId,
                IMEI: item.imei1,
                Name:item.customerName ||'Na',
                brandName: item.brandName,
                modelName: item.modelName ,
                // imei2: item.imei2,
                mrp: item.mrp,
                fileCharge: item.fileCharge,
                totalAmount: item.totalAmount,
                discount: item.discount,
                downPayment: item.downPayment,
                financeAmount: item.financeAmount,
                emi: item.emi,
                emiAmount: item.emiAmount,
                customerNumber: item.customerNumber,
                interest: item.interest,
                // time: item.time,
                '1EMi': item.installments[0].amount,
                date1: item.installments[0].payDate,
                '2EMi': item.installments[1].amount,
                date2: item.installments[1].payDate,
                '3EMi': item.installments[2] ? item.installments[2].amount : 'NA',
                date3: item.installments[2] ? item.installments[2].payDate : 'NA',
                '4EMi': item.installments[3] ? item.installments[3].amount : 'NA',
                date4: item.installments[3] ? item.installments[3].payDate : 'NA',
                '5EMi': item.installments[4] ? item.installments[4].amount : 'NA',
                date5: item.installments[4] ? item.installments[4].payDate : 'NA',
                currentCredit: item.currentCredit || 'NA',
            }
            await collection1.insertOne(newObj);
        }

        const documents = await collection1.find({}).toArray();

        // Initialize Excel workbook and worksheet
        const workbook = new Excel.Workbook();
        const worksheet = workbook.addWorksheet('Sheet1');

        // Write headers to Excel worksheet
        const headers = Object.keys(documents[0]).filter(key => key !== '_id'); // Exclude _id key
        worksheet.addRow(headers);

        // Write each document to Excel worksheet
        documents.forEach(doc => {
            // Remove the _id field from the document object
            delete doc._id;
            worksheet.addRow(Object.values(doc));
        });

        // Create a buffer containing the Excel data
        const buffer = await workbook.xlsx.writeBuffer();

        // Set response headers to indicate the file type and attachment
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="output.xlsx"');

        // Send the buffer as the response
        res.send(buffer);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};




module.exports = {
    exportDataInExcel
};



// const exportDataInExcel = async (req, res) => {
//     try {
//         const db = getDB();
//         const collection = db.collection('selldevice');

//         // Create a new Excel workbook
//         const workbook = new Excel.Workbook();
//         const worksheet = workbook.addWorksheet('Data');

//         // Query the collection to find all documents
        // const documents = await collection.find({}).toArray();

        // // Write headers to Excel worksheet
        // worksheet.addRow(Object.keys(documents[0]));

        // // Write each document to Excel worksheet
        // documents.forEach(doc => {
        //     worksheet.addRow(Object.values(doc));
        // });

        // // Save Excel file
        // const excelFilePath = path.join(__dirname, '..', 'output.xlsx');
        // await workbook.xlsx.writeFile(excelFilePath);

        // console.log('Excel file generated successfully');

        // // Send the Excel file as a response
        // res.sendFile(excelFilePath);

//     } catch (error) {
//         console.error('Error:', error);
//         return res.status(500).json({ error: 'Internal server error' });
//     }
// };