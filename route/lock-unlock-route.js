const express = require('express');
const router = express.Router();
const {unlockDevice}=require('../automode/lock-unlock-manual')


router.get('/unlock',unlockDevice);




module.exports = router;