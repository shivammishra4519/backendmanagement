const {setTemplate,viewTemplate,deleteTemplate,getTemplateByTemplateId}=require('../controler/sms-templates')
const express = require('express');
const router = express.Router();

router.post('/settemplate',setTemplate)
router.post('/viewtemplate',viewTemplate)
router.post('/deletetemplate',deleteTemplate)
router.post('/gettemplate',getTemplateByTemplateId)

module.exports = router;