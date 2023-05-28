import { ForumDataDB } from "firestoreDB/forumData/forumDataDB";
import { getForumDataDBSingletonFactory, usersDBSingletonFactory } from "../../../firestoreDB/singletonService";
import { IAddCommentRequest, IAddTopicRequest } from "models/API/forumDataReqRes";
import { IUser } from "models/basicModels";
import { UsersDB } from "../../../firestoreDB/users/userDB";

var express = require('express');
var router = express.Router();

var userDB: UsersDB = usersDBSingletonFactory.getInstance();
var forumDataDB: ForumDataDB = getForumDataDBSingletonFactory.getInstance();

router.post('/', async (req: any, res: any) => {
    let request: IAddCommentRequest = req.body;

    let username: string = 'Neregistrirani korisnik';

    if (request.authToken) {
        try {
            let user = await userDB.getUserByToken(request.authToken, true);
            username = user.username;
        } catch (e) {
            res.sendStatus(400);
            return;
        }
    }

    try {
        await forumDataDB.addComment(request.categoryId, request.topicId, username, request.text);
    } catch {
        res.sendStatus(400);
    }

    res.sendStatus(200);
});


module.exports = router;