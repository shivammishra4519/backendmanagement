const { getDB } = require('../dbconnection');
const jwt = require('jsonwebtoken');
const Excel = require('exceljs');
require('dotenv').config();

const key = process.env.secretkey;
const tokenExpiry = '12h'; // Token expiry set to 12 hours

const path = require('path');

// const exportDataInExcel = async (req, res) => {
//     try {
//         const db = getDB();
//         const collection = db.collection('selldevice');
//         const collection1 = db.collection('dummy');
//         await collection1.deleteMany({});
        
//         const result = await collection.find().toArray();

//         for (const item of result) {
//             // Remove the _id field from the item object
//             delete item._id;

            // const newObj = {
            //     Date: item.purchaseDate,
            //     loanId: item.loanId,
            //     IMEI: item.imei1,
            //     Name:item.customerName ||'Na',
            //     brandName: item.brandName,
            //     modelName: item.modelName ,
            //     // imei2: item.imei2,
            //     mrp: item.mrp,
            //     fileCharge: item.fileCharge,
            //     totalAmount: item.totalAmount,
            //     discount: item.discount,
            //     downPayment: item.downPayment,
            //     financeAmount: item.financeAmount,
            //     emi: item.emi,
            //     emiAmount: item.emiAmount,
            //     customerNumber: item.customerNumber,
            //     interest: item.interest,
            //     // time: item.time,
            //     '1EMi': item.installments[0].amount,
            //     date1: item.installments[0].payDate,
            //     '2EMi': item.installments[1].amount,
            //     date2: item.installments[1].payDate,
            //     '3EMi': item.installments[2] ? item.installments[2].amount : 'NA',
            //     date3: item.installments[2] ? item.installments[2].payDate : 'NA',
            //     '4EMi': item.installments[3] ? item.installments[3].amount : 'NA',
            //     date4: item.installments[3] ? item.installments[3].payDate : 'NA',
            //     '5EMi': item.installments[4] ? item.installments[4].amount : 'NA',
            //     date5: item.installments[4] ? item.installments[4].payDate : 'NA',
            //     currentCredit: item.currentCredit || 'NA',
            // }
//             await collection1.insertOne(newObj);
//         }

//         const documents = await collection1.find({}).toArray();

//         // Initialize Excel workbook and worksheet
//         const workbook = new Excel.Workbook();
//         const worksheet = workbook.addWorksheet('Sheet1');

//         // Write headers to Excel worksheet
//         const headers = Object.keys(documents[0]).filter(key => key !== '_id'); // Exclude _id key
//         worksheet.addRow(headers);

//         // Write each document to Excel worksheet
//         documents.forEach(doc => {
//             // Remove the _id field from the document object
//             delete doc._id;
//             worksheet.addRow(Object.values(doc));
//         });

//         // Create a buffer containing the Excel data
//         const buffer = await workbook.xlsx.writeBuffer();

//         // Set response headers to indicate the file type and attachment
//         res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//         res.setHeader('Content-Disposition', 'attachment; filename="output.xlsx"');

//         // Send the buffer as the response
//         res.send(buffer);
//     } catch (error) {
//         console.error('Error:', error);
//         return res.status(500).json({ error: 'Internal server error' });
//     }
// };


const exportDataInExcel = async (req, res) => {
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
                return res.status(400).json({ error: 'Unauthorized: Invalid token' });
            }

            const db = getDB();
            const collection = db.collection('selldevice');
            const collection1 = db.collection('dummy');
            await collection1.deleteMany({});

            const role = decodedToken.role;
            let result;

            if (role == 'admin' || role == 'employee') {
                result = await collection.find().toArray();
            } else {
                const shop = decodedToken.shop;
                result = await collection.find({ shop: shop }).toArray();
            }

            const documents = result.map(item => ({
                Date: item.purchaseDate,
                loanId: item.loanId,
                IMEI: parseInt(item.imei1),
                Name:item.customerName ||'Na',
                brandName: item.brandName,
                modelName: item.modelName ,
                shop: item.shop,
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
                '1EMi': item.installments[0].amount,
                date1: item.installments[0].payDate,
                '2EMi': item.installments[1].amount,
                date2: item.installments[1].payDate,
                '3EMi': item.installments[2] ? item.installments[2].amount : '',
                date3: item.installments[2] ? item.installments[2].payDate : '',
                '4EMi': item.installments[3] ? item.installments[3].amount : '',
                date4: item.installments[3] ? item.installments[3].payDate : '',
                '5EMi': item.installments[4] ? item.installments[4].amount : '',
                date5: item.installments[4] ? item.installments[4].payDate : '',
                currentCredit: item.currentCredit || '',
            }));

            const workbook = new Excel.Workbook();
            const worksheet = workbook.addWorksheet('Sheet1');

            // Write headers to Excel worksheet (based on the mainFields object)
            const headers = Object.keys(documents[0]);
            worksheet.addRow(headers);

            // Apply border to all rows
            worksheet.eachRow((row, rowNumber) => {
                row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                    cell.border = {
                        top: { style: 'thin', color: { argb: '000000' } }, // Black color
                        left: { style: 'thin', color: { argb: '000000' } }, // Black color
                        bottom: { style: 'thin', color: { argb: '000000' } }, // Black color
                        right: { style: 'thin', color: { argb: '000000' } } // Black color
                    };
                });
            });
            
            // Apply background color and uppercase property to the first row
            const firstRow = worksheet.getRow(1);
            firstRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFFF00' } // Yellow background color
                };
                cell.value = cell.value ? cell.value.toUpperCase() : '';
            });
            
            

            // Write each document to Excel worksheet
            documents.forEach(doc => {
                worksheet.addRow(Object.values(doc));
            });

            // Create a buffer containing the Excel data
            const buffer = await workbook.xlsx.writeBuffer();

            // Set response headers to indicate the file type and attachment
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename="output.xlsx"');

            // Send the buffer as the response
            res.send(buffer);
        });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};




const allCreadit = async (req, res) => {
    try {
        
        const db = getDB();
        const collection = db.collection('selldevice');
        
        const result = await collection.aggregate([
            {
                $addFields: {
                    purchaseDate: {
                        $dateFromString: {
                            dateString: '$purchaseDate',
                            format: '%d-%m-%Y' // Specify the format of the date string
                        }
                    }
                }
            },
            {
                $match: {
                    purchaseDate: {
                        $gte: new Date('2024-04-01'),
                        $lte: new Date('2024-04-30')
                    }
                }
            }
        ]).toArray();
        
        res.status(200).json(result);
        

        

    } catch (error) {
        console.error('Internal server error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}




module.exports = {
    exportDataInExcel,allCreadit
};



