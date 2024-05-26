const {setTemplate,viewTemplate,deleteTemplate,getTemplateByTemplateId}=require('../controler/sms-templates')
const {saveSms,getAllSms,addapi,viewApi,getTemplate,saveSmsDetails,sendSms}=require('../controler/sms-controler')
const express = require('express');
const router = express.Router();

router.post('/settemplate',setTemplate)
router.post('/viewtemplate',viewTemplate)
router.post('/deletetemplate',deleteTemplate)
router.post('/gettemplate',getTemplateByTemplateId)
router.post('/savesms',saveSms)
router.post('/getsms',getAllSms)
router.post('/set/api',addapi)
router.post('/view/api',viewApi)
router.post('/get/template',getTemplate)
router.post('/save/sms',saveSmsDetails)
router.post('/send/Sms',sendSms)

module.exports = router;