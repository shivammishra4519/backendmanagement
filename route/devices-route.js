const express = require('express');
const router = express.Router();
const {addDevice,brandNames,deviceData,viewAllDevice,viewDeviceByCustomerId,deleteDevice,updateDevice}=require('../controler/add-device')
const {sellDevice,viewDeviceList,filterData,viewAlldeviceSold,filterDataByDate,viewAllLoansByCustomerId}=require('../controler/sell-device')



router.post('/add-device',addDevice);
router.post('/delete-device',deleteDevice);
router.post('/update-device',updateDevice);
router.post('/viewbrand',brandNames);
router.post('/viewdevicedata',deviceData);
router.post('/selldevice',sellDevice);
router.post('/viwdevicelist',viewDeviceList);
router.post('/filter',filterData);
router.post('/viewalldevice',viewAllDevice);
router.post('/viewdevicebyid',viewDeviceByCustomerId);
router.post('/viewalldevicesold',viewAlldeviceSold);
router.post('/filter/device',filterDataByDate);
router.post('/view/all/loans',viewAllLoansByCustomerId);


module.exports = router;