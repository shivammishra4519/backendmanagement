const express = require('express');
const router = express.Router();
const {findDailyCollection,findAllDailyCollection,settleDailyAmount,findCollection,findUserWithWallet}=require('../controler/daily-collection')


router.post('/find/dailycollection',findDailyCollection);
router.post('/findall/dailycollection',findAllDailyCollection);
router.post('/settle/collection',settleDailyAmount);
router.post('/find/collection',findCollection);
router.post('/find/wallets',findUserWithWallet);



module.exports = router;