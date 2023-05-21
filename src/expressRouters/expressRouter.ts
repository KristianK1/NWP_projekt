var express = require('express');
var router = express.Router();

var userAuthRouter = require('./userAuths/userAuthRouter.ts');
router.use('/userAuth', userAuthRouter);

module.exports = router;