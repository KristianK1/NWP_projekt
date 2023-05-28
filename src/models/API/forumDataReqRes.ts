export interface IAddTopicRequest {
    authToken: string,
    categoryId: number,
    title: string,
    text: string,
}

export interface IAddCommentRequest {
    authToken: string,
    categoryId: number,
    topicId: number,
    text: string,
}

export interface IDeleteTopicRequest {
    authToken: string,
    categoryId: number,
    topicid: number
}

export interface IDeleteCommentRequest {
    authToken: string,
    categoryId: number,
    topicId: number,
    commentId: number,
}