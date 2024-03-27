const express = require('express');
const router = express.Router();
const {addDevice,brandNames,deviceData,viewAllDevice}=require('../controler/add-device')
const {sellDevice,viewDeviceList,filterData}=require('../controler/sell-device')



router.post('/add-device',addDevice);
router.post('/viewbrand',brandNames);
router.post('/viewdevicedata',deviceData);
router.post('/selldevice',sellDevice);
router.post('/viwdevicelist',viewDeviceList);
router.post('/filter',filterData);
router.post('/viewalldevice',viewAllDevice);


module.exports = router;