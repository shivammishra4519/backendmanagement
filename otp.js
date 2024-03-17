const express = require('express');
const bodyParser = require('body-parser');

const router = express.Router();


router.use(bodyParser.json());

router.post('/send-otp', async (req, res) => {
  try {
    const otp = generateOTP();
    res.status(200).json(otp)
  }
  catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }

});

router.post('/verify-otp', (req, res) => {
  const phoneNumber = req.body.phoneNumber;
  const otpCode = req.body.otpCode;

  if (!phoneNumber || !otpCode) {
    return res.status(400).json({ error: "Missing 'phoneNumber' or 'otpCode' field in request body" });
  }

  client.verify.services(verifySid)
    .verificationChecks
    .create({ to: phoneNumber, code: otpCode })
    .then((verification_check) => {
      console.log("Verification check status:", verification_check.status);
      res.status(200).json({ status: verification_check.status });
    })
    .catch(error => {
      console.error("Error verifying OTP:", error);
      res.status(500).json({ error: "Failed to verify OTP" });
    });
});



function generateOTP() {
  const digits = '0123456789';
  let otp = '';
  const length = 6
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * digits.length);
    otp += digits[randomIndex];
  }

  return otp;
}




module.exports = router;
