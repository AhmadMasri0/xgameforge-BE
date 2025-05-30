const express = require('express');
const userController = require('../controllers/userController');
const { checkToken } = require('../middlewares/auth');
const router = express.Router();

router.put('/change-password', checkToken, userController.changePassword);
router.put('/editProfile', checkToken, userController.updateProfile);
router.get('/me', checkToken, userController.getUser);

module.exports = router;
