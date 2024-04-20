// const puppeteer = require('puppeteer-core');
// const path = require('path'); const jwt = require('jsonwebtoken');
// const {getDB}=require('../dbconnection')
// require('dotenv').config();
// const url = process.env.frontEnd;
// const key = process.env.secretkey;
// const tokenExpiry = '12h'; // Token expiry set to 12 hours

// const downLoadTermsConditon = async (req, res) => {
//     try {
//         const number = req.query.number;
//         if (!number) {
//             return res.status(400).json({ error: 'invalid request' });
//         }

//         // Launch a headless browser instance
//         const browser = await puppeteer.launch({
//             executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
//         });

//         // Open a new page
//         const page = await browser.newPage();

//         try {
//             // Navigate to the webpage
//             await page.goto(`${url}/terms-condtiton?order=${number}`, { waitUntil: 'networkidle2' });

//             // Set up the PDF options
//             const pdfOptions = {
//                 format: 'A4', // Specify the format
//                 printBackground: true, // Include background colors and images
//             };

//             // Generate the PDF as a buffer
//             const pdfBuffer = await page.pdf(pdfOptions);

//             // Set response headers for file download
//             res.setHeader('Content-Disposition', 'attachment; filename="terms_condition.pdf"');
//             res.setHeader('Content-Type', 'application/pdf');

//             res.send(pdfBuffer);
//         } catch (error) {
//             console.error('Error generating PDF:', error);
//             res.status(500).json({ error: 'Error generating PDF' });
//         } finally {
//             // Close the browser
//             await browser.close();
//         }
//     } catch (error) {
//         console.error('Internal server error:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// };



// const downLoadInstallmentSlip = async (req, res) => {
//     try {



//         const db = getDB();
//         const collection = db.collection('selldevice');
//         const data = req.query;

//         if (!data) {
//             return res.status(400).json({ error: 'invalid request' });
//         }
//         try {
//             const result = await collection.findOne({ loanId: data.loanId });
//             if (!result) {
//                 return res.status(404).json({ message: 'Loan not found' });
//             }
//             const installment = result.installments.find(installment => installment.installmentId === data.emiId);
//             if (!installment) {
//                 return res.status(404).json({ message: 'Installment not found' });
//             }
//             const browser = await puppeteer.launch({
//                 executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
//             });
    
//             // Open a new page
//             const page = await browser.newPage();
    
//             try {
//                 // Navigate to the webpage
//                 await page.goto(`http://62.72.56.135:4200/installment-slip/loanid=${data.loanId}&emiid=${data.emiId}`, { waitUntil: 'networkidle2' });
    
//                 // Set up the PDF options
//                 const pdfOptions = {
//                     format: 'A4', // Specify the format
//                     printBackground: true, // Include background colors and images
//                 };
    
//                 // Generate the PDF as a buffer
//                 const pdfBuffer = await page.pdf(pdfOptions);
    
//                 // Set response headers for file download
//                 res.setHeader('Content-Disposition', 'attachment; filename="terms_condition.pdf"');
//                 res.setHeader('Content-Type', 'application/pdf');
    
//                 res.send(pdfBuffer);
//             } catch (error) {
//                 console.error('Error generating PDF:', error);
//                 res.status(500).json({ error: 'Error generating PDF' });
//             } finally {
//                 // Close the browser
//                 await browser.close();
//             }
//         } catch (error) {
//             console.error('Error:', error);
//             res.status(500).json({ message: 'Internal server error' });
//         }


//         // Launch a headless browser instance
      

//     } catch (error) {
//         console.error('Internal server error:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// };

// module.exports = { downLoadTermsConditon, downLoadInstallmentSlip };





const puppeteer = require('puppeteer-core');
const { getDB } = require('../dbconnection');
require('dotenv').config();
const url = process.env.frontEnd;


const downLoadTermsConditon = async (req, res) => {
    try {
        const number = req.query.number;
        if (!number) {
            return res.status(400).json({ error: 'invalid request' });
        }

        const browser = await puppeteer.launch({
            executablePath: '/usr/bin/chromium-browser',
            args: ['--no-sandbox', '--disable-setuid-sandbox'], // Update with the correct path to Chrome on your VPS
        });

        const page = await browser.newPage();

        try {

            
            await page.goto(`${url}/terms-condtiton?order=${number}`, { waitUntil: 'networkidle2' });

            const pdfOptions = {
                format: 'A4',
                printBackground: true,
            };

            await page.addStyleTag({ content: 'body { font-family: "Noto Sans Devanagari", sans-serif; }' });
            const pdfBuffer = await page.pdf(pdfOptions);

            res.setHeader('Content-Disposition', 'attachment; filename="terms_condition.pdf"');
            res.setHeader('Content-Type', 'application/pdf');

            res.send(pdfBuffer);
        } catch (error) {
            console.error('Error generating PDF:', error);
            res.status(500).json({ error: 'Error generating PDF' });
        } finally {
            await browser.close();
        }
    } catch (error) {
        console.error('Internal server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const downLoadInstallmentSlip = async (req, res) => {
    try {
        const db = getDB();
        const collection = db.collection('selldevice');
        const data = req.query;

        if (!data) {
            return res.status(400).json({ error: 'invalid request' });
        }

        try {
            const result = await collection.findOne({ loanId: data.loanId });
            if (!result) {
                return res.status(404).json({ message: 'Loan not found' });
            }
            const installment = result.installments.find(installment => installment.installmentId === data.emiId);
            if (!installment) {
                return res.status(404).json({ message: 'Installment not found' });
            }

            const browser = await puppeteer.launch({
                executablePath: '/usr/bin/chromium-browser',
                // executablePath: '/snap/bin/chromium',
                args: ['--no-sandbox', '--disable-setuid-sandbox'],// Update with the correct path to Chrome on your VPS
            });
    
            const page = await browser.newPage();
    
            try {
                // await page.goto(`https://realrobo.in/user/dashboard`, { waitUntil: 'networkidle2' });
                await page.goto(`http://62.72.56.135:4200/installment-slip/loanid=${data.loanId}&emiid=${data.emiId}`, { waitUntil: 'networkidle2' });
    
                const pdfOptions = {
                    format: 'A4',
                    printBackground: true,
                };
                await page.addStyleTag({ content: 'body { font-family: "Noto Sans Devanagari", sans-serif; }' });
                const pdfBuffer = await page.pdf(pdfOptions);
    
                res.setHeader('Content-Disposition', 'attachment; filename="terms_condition.pdf"');
                res.setHeader('Content-Type', 'application/pdf');
    
                res.send(pdfBuffer);
            } catch (error) {
                console.error('Error generating PDF:', error);
                res.status(500).json({ error: 'Error generating PDF' });
            } finally {
                await browser.close();
            }
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    } catch (error) {
        console.error('Internal server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { downLoadTermsConditon, downLoadInstallmentSlip };

