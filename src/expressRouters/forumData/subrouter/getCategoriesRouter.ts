import { ForumDataDB } from "firestoreDB/forumData/forumDataDB";
import { getForumDataDBSingletonFactory } from "../../../firestoreDB/singletonService";

var express = require('express');
var router = express.Router();

var forumDataDB: ForumDataDB = getForumDataDBSingletonFactory.getInstance();

router.get('/', async (req: any, res: any) => {
    res.json(await forumDataDB.getCategories());
});


module.exports = router;