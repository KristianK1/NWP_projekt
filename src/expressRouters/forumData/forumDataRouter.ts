var express = require('express');
var router = express.Router();


var getCategoriesRouter = require('./subrouter/getCategoriesRouter.ts');
router.use('/categories', getCategoriesRouter);

var getTopicsRouter = require('./subrouter/getTopicsRouter.ts');
router.use('/topics', getTopicsRouter);

var getCommentsRouter = require('./subrouter/getCommentsRouter.ts');
router.use('/comments', getCommentsRouter);

var deleteTopicRouter = require('./subrouter/deleteTopicRouter.ts');
router.use('/deleteTopic', deleteTopicRouter);

var deleteCommentRouter = require('./subrouter/deleteCommentRouter.ts');
router.use('/deleteTopic', deleteCommentRouter);

var addTopicRouter = require('./subrouter/addTopicRouter.ts');
router.use('/addTopic', addTopicRouter);

var addCommentRouter = require('./subrouter/addCommentRouter');
router.use('/addComment', addCommentRouter);

module.exports = router;