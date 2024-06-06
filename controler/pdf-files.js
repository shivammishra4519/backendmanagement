
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
        // const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });
        const browser = await puppeteer.launch({
            executablePath: '/usr/bin/chromium-browser',
            args: ['--no-sandbox', '--disable-setuid-sandbox'], // Update with the correct path to Chrome on your VPS
        });

        const page = await browser.newPage();

        try {


            await page.goto(`${url}/terms-condtiton?number=${number}`, { waitUntil: 'networkidle2' });

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

        if (!data || !data.loanId || !data.emiId) {
            return res.status(400).json({ error: 'Invalid request. Missing loanId or emiId.' });
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
            const paid = installment.paid;
            if (!paid) {
                console.log(data)
                return res.status(400).json({ message: 'EMI not paid yet' });
            }
            // const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });
            const browser = await puppeteer.launch({
                executablePath: '/usr/bin/chromium-browser',
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            });
            // const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });

            const page = await browser.newPage();
            // await page.setViewport({
            //     width: 800, // 80mm in pixels (assuming 1mm = 10 pixels)
            //     height: 600, // Adjust the height as needed
            //     deviceScaleFactor: 1,
            //   });
            try {
                await page.goto(`${url}/installment-slip?loanid=${data.loanId}&emiId=${data.emiId}`, { waitUntil: 'networkidle2' });

                const pdfOptions = {
                    format: 'A4',
                    printBackground: true,
                };
                await page.addStyleTag({ content: 'body { font-family: "Noto Sans Devanagari", sans-serif; }' });
                const pdfBuffer = await page.pdf(pdfOptions);

                res.setHeader('Content-Disposition', 'attachment; filename="installment-slip.pdf"');
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

const downloadAggrement = async (req, res) => {
    try {
        const db = getDB();
        const collection = db.collection('selldevice');
        const data = req.query;

        if (!data || !data.loanId || !data.shopId) {
            return res.status(400).json({ error: 'Invalid request. Missing loanId or emiId.' });
        }


        const url = process.env.frontEnd; // Define the front-end URL
        // const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });
        const browser = await puppeteer.launch({
            executablePath: '/usr/bin/chromium-browser',
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const page = await browser.newPage();
        

        try {
            // Navigate to the webpage
            await page.goto(`${url}/aggrement?customerId=${data.customerId}&shopId=${data.shopId}&loanId=${data.loanId}`, { waitUntil: 'networkidle2' });

            // Set up the PDF options
            const pdfOptions = {
                format: 'A4',
                printBackground: true,
            };

            // Generate the PDF as a buffer
            const pdfBuffer = await page.pdf(pdfOptions);


            // Set response headers for file download
            res.setHeader('Content-Disposition', 'attachment; filename="aggrement.pdf"');
            res.setHeader('Content-Type', 'application/pdf');
            res.send(pdfBuffer);
        } catch (error) {
            console.error('Error generating PDF:', error);
            res.status(500).json({ error: 'Error generating PDF' });
        } finally {
            // Close the browser
            await browser.close();
        }
    } catch (error) {
        console.error('Internal server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const downloadInvoiceForCustomer = async (req, res) => {
    try {
        const db = getDB();
        const collection = db.collection('selldevice');
        const data = req.query;

        if (!data || !data.loanId) {
            return res.status(400).json({ error: 'Invalid request. Missing loanId or emiId.' });
        }


        const url = process.env.frontEnd; // Define the front-end URL
        // const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });
        const browser = await puppeteer.launch({
            executablePath: '/usr/bin/chromium-browser',
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const page = await browser.newPage();

        try {
            // Navigate to the webpage
            await page.goto(`${url}/invoice-customer?loanId=${data.loanId}&invoice=${data.invoice}`, { waitUntil: 'networkidle2' });

            const pdfOptions = {
                format: 'A4',
                printBackground: true,
            };

            // Generate the PDF as a buffer
            const pdfBuffer = await page.pdf(pdfOptions);

            // Set response headers for file download
            res.setHeader('Content-Disposition', 'attachment; filename="invoice.pdf"');
            res.setHeader('Content-Type', 'application/pdf');
            res.send(pdfBuffer);
        } catch (error) {
            console.error('Error generating PDF:', error);
            res.status(500).json({ error: 'Error generating PDF' });
        } finally {
            // Close the browser
            await browser.close();
        }
    } catch (error) {
        console.error('Internal server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const downloadGaurntorCondition = async (req, res) => {
    try {
        const db = getDB();
        const collection = db.collection('selldevice');
        const data = req.query;
  
        if (!data || !data.number) {
            return res.status(400).json({ error: 'Invalid request. Missing loanId or emiId.' });
        }


        const url = process.env.frontEnd; // Define the front-end URL
        const browser = await puppeteer.launch({
            executablePath: '/usr/bin/chromium-browser',
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        // const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:false});
        const page = await browser.newPage();

        try {
            // Navigate to the webpage
            // guarantor-condtiton?number=5426859625
            await page.goto(`${url}/guarantor-condtiton?number=${data.number}`, { waitUntil: 'networkidle2' });

            // Set up the PDF options
            const pdfOptions = {
                format: 'A4',
                printBackground: true,
            };

            // Generate the PDF as a buffer
            const pdfBuffer = await page.pdf(pdfOptions);

            // Set response headers for file download
            res.setHeader('Content-Disposition', 'attachment; filename="gaurantor-agreement.pdf"');
            res.setHeader('Content-Type', 'application/pdf');
            res.send(pdfBuffer);
        } catch (error) {
            console.error('Error generating PDF:', error);
            res.status(500).json({ error: 'Error generating PDF' });
        } finally {
            // Close the browser
            await browser.close();
        }
    } catch (error) {
        console.error('Internal server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const dataForInvoice = async (req, res) => {
    try {
        const data = req.body;

        const db = getDB();
        const collection = db.collection('selldevice');
        const collection1 = db.collection('users');
        const result = await collection.findOne({ loanId: data.loanId });
        const result1 = await collection1.findOne({ number: parseInt(data.number) }, {
            projection: {
                number: 1,
                shopName: 1,
                state: 1,
                district: 1,
                GSTIN: 1,
                panNo: 1,
                _id: 0
            }
        });

        if (result || result1) {
            return res.status(200).json({ result, result1 })
        }
        res.status(400).json({ message: 'data not found' })
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}


const findPlaceOfUserAndCustomer = async (req, res) => {
    try {
        const db = getDB();
        const data = req.body;

        const findShopPlace = await db.collection('users').findOne({ number: parseInt(data.shopId) }, { projection: { address: 1, _id: 0 } });
        const customerPlace = await db.collection('customers').findOne({ number: parseInt(data.customerId,) }, { projection: { state: 1, district: 1, address: 1, firstName: 1, _id: 0 } });
        const loanDate = await db.collection('selldevice').findOne({ loanId: data.loanId }, {
            projection: {
                purchaseDate: 1, _id: 0
            }
        });
        if (findShopPlace || customerPlace || loanDate) {
            return res.status(200).json({ findShopPlace, customerPlace, loanDate })
        }
        res.status(400).json({ message: 'data not found' })

    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

const detailsOfAdmin = async (req, res) => {
    try {
        const db = getDB();
        const collection = db.collection('users');
        const find = await collection.findOne({ role: 'admin' }, { projection: { address: 1, contactNumber: 1, bankDetails: 1, companyName: 1, _id: 0 } });
        return res.status(200).json(find);

    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

const findLoanDetails = async (req, res) => {
    try {

        const db = getDB();
        const data = req.body;

        const loanDetails = await db.collection('selldevice').findOne({ loanId: data.loanId });

        if (!loanDetails) {
            return res.status(400).json({ message: 'invalid loan id' })
        }
        const customerNumber = loanDetails.customerNumber;

        const customerResult = await db.collection('customers').findOne({ number: customerNumber });
        res.status(200).json({ loanDetails, customerResult });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    downLoadTermsConditon, downLoadInstallmentSlip, dataForInvoice,
    findPlaceOfUserAndCustomer, downloadAggrement, detailsOfAdmin, findLoanDetails, downloadInvoiceForCustomer, downloadGaurntorCondition
};

