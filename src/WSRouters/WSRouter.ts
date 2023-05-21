import { IWSSMessage, IWSSBasicConnection, IWSSConnectionUser, IWSSUserConnectRequest } from 'models/WSS/wssConnectionReqRes';
import { server, request, connection, Message } from 'websocket';
import { addUserConnection } from './subrouter/WSConnect';
import { v4 as uuid } from 'uuid';
import { getCurrentTimeISO, getCurrentTimeUNIX } from '../generalStuff/timeHandlers';
import { usersDBSingletonFactory } from '../firestoreDB/singletonService';
import { UsersDB } from '../firestoreDB/users/userDB';
import { ELogoutReasons, ILoggedReason, IWSSMessageForUser } from '../models/frontendModels';


var userDB: UsersDB = usersDBSingletonFactory.getInstance();

const WSRouterEmitCheckInterval = 200;
const WSRouterSlowTapInterval = 1000;
const WSRouterSlowTapOverrideInterval = WSRouterSlowTapInterval + WSRouterEmitCheckInterval + 5; //avoid collision from slowTap emit and a "normal" emit

export class MyWebSocketServer {
    private wsServer: server;

    private allClients: IWSSBasicConnection[] = [];
    private userClients: IWSSConnectionUser[] = [];

    private deviceDataEmitQueue: IWSSConnectionUser[] = [];

    public setupServer(server: server) {
        this.wsServer = server;

        this.wsServer.on('request', (request: request) => {
            console.log('new r');

            let connection = request.accept(null, request.origin);
            let newConnection: IWSSBasicConnection = {
                connection: connection,
                connectionUUID: uuid(),
                startedAt: getCurrentTimeISO(),
            };
            this.allClients.push(newConnection);
            console.log('uuid in reqq ' + newConnection.connectionUUID);

            newConnection.connection.on('message', async (message: Message) => {
                if (message.type !== 'utf8') return;

                if (message.utf8Data.includes("clear")) {
                    for (let client of this.allClients) {
                        client.connection.close()
                    }
                    this.allClients = []
                    this.userClients = []
                }

                let wsMessage: IWSSMessage;
                try {
                    wsMessage = JSON.parse(message.utf8Data);
                } catch {
                    return;
                }

                console.log(wsMessage)
                switch (wsMessage.messageType) {
                    case 'connectUser':
                        let connectUserRequest = wsMessage.data as IWSSUserConnectRequest;
                        let userConn = await addUserConnection(connectUserRequest, newConnection);
                        if (!userConn) {
                            let logoutData: ILoggedReason = { logoutReason: ELogoutReasons.LogoutMyself }
                            newConnection.connection.sendUTF(JSON.stringify(logoutData));
                            setInterval(() => {
                                newConnection.connection.close();
                            }, 5000);
                            return
                        }
                        this.userClients.push(userConn);
                        console.log('user connected')
                        break;
                    default:
                        console.log('unprocessed message');
                        console.log(wsMessage);
                        break;
                }
            });
        });

        this.wsServer.on('close', (connection: connection, reason: number, desc: string) => {
            console.log('closed conn');

            for (let i = 0; i < this.allClients.length; i++) {
                if (this.allClients[i].connection === connection) {
                    this.allClients.splice(i, 1);
                }
            }
            for (let i = 0; i < this.userClients.length; i++) {
                if (this.userClients[i].basicConnection.connection === connection) {
                    console.log(this.userClients[i].authToken)
                    console.log("closed " + this.userClients[i].basicConnection.connectionUUID);
                    this.userClients.splice(i, 1);
                    return;
                }
            }
        });

        setInterval(() => {
            // console.log("wsRouter Queue check. Size: " + this.deviceDataEmitQueue.length + "                        " + getCurrentTimeISO());
            for(let i = 0; i < this.deviceDataEmitQueue.length; i++){
                let connection = this.deviceDataEmitQueue[i];
                console.log(i + ": fromLastEmit: " + (getCurrentTimeUNIX() - connection.lastEmited));
                if(getCurrentTimeUNIX() - connection.lastEmited > WSRouterSlowTapInterval){
                    console.log("emit " + i);
                    
                    this.deviceDataEmitQueue.splice(i,1);
                    i--;
                }
                console.log();
            }
        }, WSRouterEmitCheckInterval)
    }

    //<logout>
    async logoutAllUsersSessions(userId: number, reason: ELogoutReasons, safeToken?: string) {
        let clients = this.userClients.filter(client => client.userId === userId);
        let logoutReason: ILoggedReason = { logoutReason: reason };
        let message: IWSSMessageForUser= {
            messageType: "userMessage",
            data: logoutReason,           
        }
        for (let client of clients) {
            if (client.authToken === safeToken) continue;
            client.basicConnection.connection.sendUTF(JSON.stringify(message));
            setTimeout(() => {
                try {
                    client.basicConnection.connection.close();
                } catch {
                    console.log('failed to close ' + client.userId);
                }
            }, 5000);
        }
    }

    async logoutUserSession(token: string, reason: ELogoutReasons) {
        let clients = this.userClients.filter(client => client.authToken === token);
        let logoutReason: ILoggedReason = { logoutReason: reason };
        let message: IWSSMessageForUser= {
            messageType: "userMessage",
            data: logoutReason,           
        }
        for (let client of clients) {
            client.basicConnection.connection.sendUTF(JSON.stringify(message));
            setTimeout(() => {
                try {
                    client.basicConnection.connection.close();
                } catch {
                    console.log('failed to close ' + client.userId);
                }
            }, 1000);
        }
    }
    //</logout>
    

    private async sendDataToUserConnection(data: string, userConnection: IWSSConnectionUser, urgent?: boolean){
        if(urgent){
            userConnection.basicConnection.connection.sendUTF(data);
        }else{
            let currentTime = getCurrentTimeUNIX();
            if(currentTime - userConnection.lastEmited > WSRouterSlowTapOverrideInterval){
                //enough time has passed from some old emit to this connection
                userConnection.basicConnection.connection.sendUTF(data);
                userConnection.lastEmited = getCurrentTimeUNIX();
            }
            else{
                let exists = !!this.deviceDataEmitQueue.find(o => o.basicConnection === userConnection.basicConnection );
                if(!exists){
                    this.deviceDataEmitQueue.push(userConnection);
                }
            }
        }
    }
    //<send>
}