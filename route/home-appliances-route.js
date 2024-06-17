const homeAppliance=require('../controler/home-appliances')
const express = require('express');
const router = express.Router();


router.post('/add/brand',homeAppliance.addBrand);
router.post('/get/brand',homeAppliance.getAllData);
router.post('/save/model',homeAppliance.saveDevieInfo);
router.post('/get/model',homeAppliance.getAllDevices);
router.post('/delete/model',homeAppliance.deleteDevice);
router.post('/update/model',homeAppliance.updateDevice);
router.post('/get/all/brands',homeAppliance.brandNames);
router.post('/brand/model',homeAppliance.deviceData);
 

module.exports=router;