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
