import { usersDBSingletonFactory } from "../../firestoreDB/singletonService";
import { UsersDB } from "firestoreDB/users/userDB";
import { IWSSBasicConnection, IWSSConnectionUser, IWSSUserConnectRequest } from "models/WSS/wssConnectionReqRes";
import { IUser } from "models/basicModels";

var userDb: UsersDB = usersDBSingletonFactory.getInstance();

export async function addUserConnection(request: IWSSUserConnectRequest, basicConnection: IWSSBasicConnection) {
    let user: IUser;
    try {
        user = await userDb.getUserByToken(request.authToken, true);
    } catch (e) {
        console.log(e.message);
        return;
    }
    let connection: IWSSConnectionUser = {
        basicConnection: {
            connection: basicConnection.connection,
            connectionUUID: basicConnection.connectionUUID,
            startedAt: basicConnection.startedAt,
        },
        frontendType: request.frontendType,
        userId: user.id,
        authToken: request.authToken,
        lastEmited: 0,
    };

    return connection;
}