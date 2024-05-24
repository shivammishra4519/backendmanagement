const express = require('express');
const router = express.Router();
const {customerLogin}=require('../app/customer')


router.post('/login',customerLogin);




module.exports = router;