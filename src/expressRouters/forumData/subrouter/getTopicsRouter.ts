import { ForumDataDB } from "firestoreDB/forumData/forumDataDB";
import { getForumDataDBSingletonFactory } from "../../../firestoreDB/singletonService";

var express = require('express');
var router = express.Router();

var forumDataDB: ForumDataDB = getForumDataDBSingletonFactory.getInstance();

router.get('/:catId', async (req: any, res: any) => {
    let catId = req.params.catId;
    res.json(await forumDataDB.getTopics(catId));
});


module.exports = router;