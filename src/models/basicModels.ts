export interface IUser {
    id: number,
    username: string,
    email: string,
    password: string,
}

export interface IAuthToken {
    authToken: string,
    userId: number,
    validUntil: string,
}

export interface ICategory {
    id: number,
    title: string,
    maxTopicId: number,
}

export interface ITopic {
    id: number,
    title: string,
    timestamp: string,
    username: string,
    userId: number,
    text: string,
    maxCommentId: number,
    // comments: IComment[] | undefined,
}

export interface IComment {
    id: number,
    username: string,
    userId: number,
    text: string,
    timestamp: string,
}
