var express = require('express');
var router = express.Router();

var userAuthRouter = require('./userAuths/userAuthRouter.ts');
router.use('/userAuth', userAuthRouter);

var forumDataRouter = require('./forumData/forumDataRouter.ts');
router.use('/forumData', forumDataRouter);

module.exports = router;