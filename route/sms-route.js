const {setTemplate,viewTemplate,deleteTemplate,getTemplateByTemplateId}=require('../controler/sms-templates')
const {saveSms,getAllSms}=require('../controler/sms-controler')
const express = require('express');
const router = express.Router();

router.post('/settemplate',setTemplate)
router.post('/viewtemplate',viewTemplate)
router.post('/deletetemplate',deleteTemplate)
router.post('/gettemplate',getTemplateByTemplateId)
router.post('/savesms',saveSms)
router.post('/getsms',getAllSms)

module.exports = router;