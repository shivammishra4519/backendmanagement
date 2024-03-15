const express = require('express');
const multer = require('multer');
const Joi = require('joi');
const fs = require('fs');
const path = require('path');


const router = express.Router();

// Multer configuration for handling file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
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



router.post('/upload', upload.fields([
    { name: 'profilePictures', maxCount: 1 },
    { name: 'panCardImages', maxCount: 1 },
    { name: 'adharCardImages', maxCount: 1 },
    { name: 'otherDocumentImages', maxCount: 1 }
]), (req, res) => {
    try {
        const filenames = {};

        // Validate and process profile picture
        if (req.files['profilePictures'] && req.files['profilePictures'].length > 0) {
            const file = req.files['profilePictures'][0];
            const { error, value } = uploadSchema.validate({
                filename: file.filename,
                mimetype: file.mimetype,
                buffer: file.buffer
            });
            if (error) {
                fs.unlinkSync(file.path);
                return res.status(400).json({ error: error.details[0].message });
            }
            filenames['profilePictures'] = file.filename;
        }

        // Validate and process PAN card image
        if (req.files['panCardImages'] && req.files['panCardImages'].length > 0) {
            const file = req.files['panCardImages'][0];
            const { error, value } = uploadSchema.validate({
                filename: file.filename,
                mimetype: file.mimetype,
                buffer: file.buffer
            });
            if (error) {
                fs.unlinkSync(file.path);
                return res.status(400).json({ error: error.details[0].message });
            }
            filenames['panCardImages'] = file.filename;
        }

        // Validate and process Adhar card image
        if (req.files['adharCardImages'] && req.files['adharCardImages'].length > 0) {
            const file = req.files['adharCardImages'][0];
            const { error, value } = uploadSchema.validate({
                filename: file.filename,
                mimetype: file.mimetype,
                buffer: file.buffer
            });
            if (error) {
                fs.unlinkSync(file.path);
                return res.status(400).json({ error: error.details[0].message });
            }
            filenames['adharCardImages'] = file.filename;
        }

        // Validate and process other document image
        if (req.files['otherDocumentImages'] && req.files['otherDocumentImages'].length > 0) {
            const file = req.files['otherDocumentImages'][0];
            const { error, value } = uploadSchema.validate({
                filename: file.filename,
                mimetype: file.mimetype,
                buffer: file.buffer
            });
            if (error) {
                fs.unlinkSync(file.path);
                return res.status(400).json({ error: error.details[0].message });
            }
            filenames['otherDocumentImages'] = file.filename;
        }
        
        // Sending a response with all uploaded filenames
        res.status(200).json({ filenames: filenames, message: 'Images uploaded successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error uploading images');
    }
});

router.post('/images/', async (req, res) => {
    try {
        const imageName = req.body.fileName;
        const imagePath = path.join(__dirname, 'uploads', imageName);
        
        // Check if the image file exists
        if (fs.existsSync(imagePath)) {
            // Set appropriate content-type header
            res.setHeader('Content-Type', 'image/png'); // Adjust content type based on your image type
            // Send the image file as a response
            res.sendFile(imagePath);
        } else {
            // If the image file does not exist, return a 404 Not Found error
            res.status(404).json({ message: 'Image not found' });
        }
    } catch (error) {
        console.error('Error serving image:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


module.exports = router;