const express = require('express');
const multer = require('multer');
const Joi = require('joi');
const fs = require('fs');
const path = require('path');


const router = express.Router();

// Multer configuration for handling file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'gaurantor/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Joi schema for validating file upload
const uploadSchema = Joi.object({
    filename: Joi.string(),
    mimetype: Joi.string(),
    buffer: Joi.binary()
});


router.post('/upload/guarantor', upload.fields([
    { name: 'profilePictures', maxCount: 1 },
    { name: 'aadharCardImagesBack', maxCount: 1 },
    { name: 'aadharCardImagesFront', maxCount: 1 },
]), async (req, res) => {
    try {
        const filenames = {};

        // Helper function to validate and process an image upload
        const processImageUpload = async (fieldName) => {
            if (!req.files[fieldName] || req.files[fieldName].length === 0) {
                throw new Error(`No file uploaded for ${fieldName}`);
            }
            const file = req.files[fieldName][0];
        
            const { error, value } = uploadSchema.validate({
                filename: file.filename,
                mimetype: file.mimetype,
                buffer: file.buffer
            });
            if (error) {
                fs.unlinkSync(file.path);
              
                throw new Error(error.details[0].message);
            }
            filenames[fieldName] = file.filename;
            console.log('File processed successfully:', file.originalname);
        };

        // Validate and process profile picture
        await processImageUpload('profilePictures');
        // Validate and process PAN card image
        await processImageUpload('aadharCardImagesFront');
        // Validate and process Adhar card image
        await processImageUpload('aadharCardImagesBack');
        // Validate and process other document image
     

        // Sending a response with all uploaded filenames
        // console.log('Images uploaded successfully:', filenames);
        res.status(200).json({ filenames: filenames, message: 'Images uploaded successfully' });
    } catch (error) {
        console.error('Error uploading images:', error);
        res.status(400).json({ error: error.message });
    }
});


router.post('/images/guarantor', async (req, res) => {
    try {
        const imageName = req.body.fileName;
        console.log(imageName)
        
        // Check if imageName is provided
        if (!imageName) {
            return res.status(400).json({ message: 'Image name not provided' });
        }

        // Construct the absolute path to the image file
        const imagePath = path.join(__dirname, 'gaurantor', imageName);
        console.log(imagePath);
        // Check if the image file exists
        if (fs.existsSync(imagePath)) {
            // Set appropriate content-type header
            console.log('imagePath',imagePath);
            res.setHeader('Content-Type', 'image/png');
            
            // Send the image file
            res.sendFile(imagePath);
        } else {
            // If image file does not exist, return 404 error
            res.status(404).json({ message: 'Image not found' });
        }
    } catch (error) {
        // If an error occurs, return a 500 error
        console.error('Error serving image:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});




module.exports = router;