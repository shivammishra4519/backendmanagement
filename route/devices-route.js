const express = require('express');
const router = express.Router();
const {addDevice,brandNames,deviceData,viewAllDevice,viewDeviceByCustomerId}=require('../controler/add-device')
const {sellDevice,viewDeviceList,filterData,viewAlldeviceSold}=require('../controler/sell-device')



router.post('/add-device',addDevice);
router.post('/viewbrand',brandNames);
router.post('/viewdevicedata',deviceData);
router.post('/selldevice',sellDevice);
router.post('/viwdevicelist',viewDeviceList);
router.post('/filter',filterData);
router.post('/viewalldevice',viewAllDevice);
router.post('/viewdevicebyid',viewDeviceByCustomerId);
router.post('/viewalldevicesold',viewAlldeviceSold);


module.exports = router;