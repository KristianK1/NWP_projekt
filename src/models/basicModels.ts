import { IUserRight } from "./userRightsModels";

export interface IUser {
    id: number,
    username: string,
    email: string,
    password: string,
    userRight: IUserRight,
}

export interface IAuthToken {
    authToken: string,
    userId: number,
    validUntil: string,
}
