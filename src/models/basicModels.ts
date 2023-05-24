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

export interface ICategory {
    title: string,
    maxTopicId: number,
}

export interface ITopic {
    title: string,
    timestamp: string,
    createdBy: string,
    text: string,
    maxCommentId: number,
    // comments: IComment[] | undefined,
}

export interface IComment {
    createdBy: string,
    text: string,
}
