const express = require('express');
const router = express.Router();
const {getAllState}=require('../controler/citynames')


router.post('/state',getAllState);



module.exports = router;