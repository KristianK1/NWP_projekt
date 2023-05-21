import { usersDBSingletonFactory } from '../../../firestoreDB/singletonService';
import { UsersDB } from 'firestoreDB/users/userDB';
import { IDeleteUserRequest } from '../../../models/API/loginRegisterReqRes';
import { MyWebSocketServer } from "../../../WSRouters/WSRouter";
import { wsServerSingletonFactory } from "../../../WSRouters/WSRouterSingletonFactory";
import { IUser } from '../../../models/basicModels';
import { ELogoutReasons } from '../../../models/frontendModels';

var express = require('express');
var router = express.Router();

var userDb: UsersDB = usersDBSingletonFactory.getInstance();
var wsServer: MyWebSocketServer = wsServerSingletonFactory.getInstance();


router.post('/', async (req: any, res: any) => {
    const deleteReq: IDeleteUserRequest = req.body;
    let user: IUser;

    try {
        user = await userDb.getUserByToken(deleteReq.authToken, false);
    } catch (e) {
        res.status(400);
        res.send(e.message);
        return;
    }

    try {
        await userDb.deleteUser(deleteReq.authToken);
        await wsServer.logoutAllUsersSessions(user.id, ELogoutReasons.DeletedUser, deleteReq.authToken);
    } catch (e) {
        res.status(400);
        res.send(e.message);
        return;
    }
    res.sendStatus(200);
});

module.exports = router;