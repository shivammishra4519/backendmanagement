const express = require('express');
const router = express.Router();
const {addAbrand,viewBrand}=require('../controler/brand-controler')


router.post('/add',addAbrand);
router.post('/view',viewBrand);



module.exports = router;