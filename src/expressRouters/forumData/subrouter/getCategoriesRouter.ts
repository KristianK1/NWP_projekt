import { ForumDataDB } from "firestoreDB/forumData/forumDataDB";
import { getForumDataDBSingletonFactory } from "../../../firestoreDB/singletonService";
import { FrontEndCategories } from "models/frontendModels";

var express = require('express');
var router = express.Router();

var forumDataDB: ForumDataDB = getForumDataDBSingletonFactory.getInstance();

router.get('/', async (req: any, res: any) => {
    let cats = await forumDataDB.getCategories();
    let forHandCats: FrontEndCategories[] = [];
    for(let cat of cats){
        forHandCats.push({
            title: cat.title,
            id: cat.id,
        });
    }
    res.json(forHandCats);
});


module.exports = router;