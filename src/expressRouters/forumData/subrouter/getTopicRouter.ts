import { ForumDataDB } from "firestoreDB/forumData/forumDataDB";
import { getForumDataDBSingletonFactory } from "../../../firestoreDB/singletonService";

var express = require('express');
var router = express.Router();

var forumDataDB: ForumDataDB = getForumDataDBSingletonFactory.getInstance();

router.get('/:catId/:topicId', async (req: any, res: any) => {
    let catId = req.params.catId;
    let topicId = req.params.topicId;
    try{
        res.json(await forumDataDB.getTopic(catId, topicId));
    }catch{
        res.sendStatus(400);
    }
});


module.exports = router;