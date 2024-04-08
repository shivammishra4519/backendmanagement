const express = require('express');
const router = express.Router();
const {saveMessage}=require('../controler/contact-us-controler')


router.post('/save',saveMessage);




module.exports = router;