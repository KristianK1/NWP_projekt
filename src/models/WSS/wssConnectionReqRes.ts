import { connection } from "websocket"

export interface IWSSMessage {
    messageType: 'connectUser',
    data: IWSSUserConnectRequest
}

export interface IWSSUserConnectRequest {
    authToken: string,
    frontendType: EFrontendType,
}

export interface IWSSBasicConnection {
    startedAt: string,
    connection: connection,
    connectionUUID: string,
}

export interface IWSSConnectionUser {
    userId: number,
    authToken: string,
    basicConnection: IWSSBasicConnection,
    frontendType: EFrontendType,
    lastEmited: number,
}

export enum EFrontendType {
    Web,
    ResponsiveWeb,
    AndroidApp,
    WearOs,
}
