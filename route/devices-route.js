const express = require('express');
const router = express.Router();
const {addDevice,brandNames,deviceData,sellDevice}=require('../controler/add-device')



router.post('/add-device',addDevice);
router.post('/viewbrand',brandNames);
router.post('/viewdevicedata',deviceData);
router.post('/selldevice',sellDevice);


module.exports = router;