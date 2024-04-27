const express = require('express');
const router = express.Router();
const {findDailyCollection,findAllDailyCollection,settleDailyAmount}=require('../controler/daily-collection')


router.post('/find/dailycollection',findDailyCollection);
router.post('/findall/dailycollection',findAllDailyCollection);
router.post('/settle/collection',settleDailyAmount);



module.exports = router;