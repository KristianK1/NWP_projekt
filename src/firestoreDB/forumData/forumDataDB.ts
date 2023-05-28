import { EmailService, emailServiceSingletonFactory } from "../../emailService/emailService";
import { getMaxIds } from "firestoreDB/MaxIDs/MaxIDs";
import { FirestoreDB } from "firestoreDB/firestore";
import { firestoreSingletonFactory, getMaxIDSingletonFactory } from "../../firestoreDB/singletonService";
import { getCurrentTimeISO } from "../../generalStuff/timeHandlers";
import { ICategory, IComment, ITopic } from "models/basicModels";




export class ForumDataDB {

    static catsCollName = "categories";
    static catsDocNamePrefix = "cat";
    static topicsCollName = "topics";
    static topicDocNamePrefix = "topic";
    static commentsCollName = "comments";
    static commentDocNamePrefix = "comm";

    firestore: FirestoreDB;
    getMaxIds: getMaxIds;
    emailService: EmailService;

    constructor() {
        this.firestore = firestoreSingletonFactory.getInstance();
        this.getMaxIds = getMaxIDSingletonFactory.getInstance();
        this.emailService = emailServiceSingletonFactory.getInstance();
    }

    async getCategories(): Promise<ICategory[]> {
        let categories: ICategory[] = [];
        for (let i = 0; ; i++) {
            let category = await this.firestore.getDocumentData(ForumDataDB.catsCollName, ForumDataDB.catsDocNamePrefix + i);
            if (category) {
                categories.push(category);
            }
            else break;
        }
        return categories;
    }

    
    async getTopics(category: number): Promise<ITopic[]> {
        let categoryData: ICategory = await this.firestore.getDocumentData(`${ForumDataDB.catsCollName}`, `${ForumDataDB.catsDocNamePrefix}${category}`);
        let maxID = categoryData.maxTopicId;

        let topics: ITopic[] = [];
        let topicCollName = this.getTopicCollName(category);
        for (let i = 0; i <= maxID; i++) {
            let topicDocName = `${ForumDataDB.topicDocNamePrefix}${i}`;
            let topic: ITopic = await this.firestore.getDocumentData(topicCollName, topicDocName);
            if (topic) {
                topics.push(topic);
            }
        }
        return topics;
    }

    async getComments(categoryId: number, topicId: number): Promise<IComment[]> {
        let topicCollName = this.getTopicCollName(categoryId);
        let topicDocName = this.getTopicDocName(topicId);

        let topic: ITopic = await this.firestore.getDocumentData(topicCollName, topicDocName);

        let maxId = topic.maxCommentId;

        let commentsCollName = this.getCommentCollName(categoryId, topicId);

        let comments: IComment[] = [];
        for (let i = 0; i <= maxId; i++) {
            let commentDocName = this.getCommentDocName(i);
            let comment: IComment = await this.firestore.getDocumentData(commentsCollName, commentDocName);
            if (comment) {
                comments.push(comment);
            }
        }

        return comments;
    }

    async addTopic(category: number, owner: string, title: string, text: string) {
        let categoryData: ICategory = await this.firestore.getDocumentData(ForumDataDB.catsCollName, ForumDataDB.catsDocNamePrefix + category);
        let newId = categoryData.maxTopicId + 1;

        await this.firestore.updateDocumentValue(ForumDataDB.catsCollName, ForumDataDB.catsDocNamePrefix + category, {
            maxTopicId: newId,
        });

        let newCollPath = `${ForumDataDB.catsCollName}/${ForumDataDB.catsDocNamePrefix}${category}/${ForumDataDB.topicsCollName}`;
        let newDocName = `${ForumDataDB.topicDocNamePrefix}${newId}`;

        let newTopicData: ITopic = {
            id: newId,
            title: title,
            createdBy: owner,
            text: text,
            timestamp: getCurrentTimeISO(),
            maxCommentId: 0,
        }

        await this.firestore.setDocumentValue(newCollPath, newDocName, newTopicData);
    }

    async addComment(category: number, topic: number, owner: string, text: string) {
        let topicCollectionPath = `${ForumDataDB.catsCollName}/${ForumDataDB.catsDocNamePrefix}${category}/${ForumDataDB.topicsCollName}`
        let topicDocumentName = `${ForumDataDB.topicDocNamePrefix}${topic}`
        let topicData: ITopic = await this.firestore.getDocumentData(topicCollectionPath, topicDocumentName);

        let newCommentId = topicData.maxCommentId + 1;

        await this.firestore.updateDocumentValue(topicCollectionPath, topicDocumentName, {
            maxCommentId: newCommentId,
        });

        let commentCollectionPath = `${topicCollectionPath}/${topicDocumentName}/${ForumDataDB.commentsCollName}`;
        let commentDocName = `${ForumDataDB.commentDocNamePrefix}${newCommentId}`;

        let newCommentData: IComment = {
            id: newCommentId,
            createdBy: owner,
            text: text,
        }

        await this.firestore.setDocumentValue(commentCollectionPath, commentDocName, newCommentData);
    }

    async deleteTopic(categoryId: number, topicId: number) {

    }

    async deleteComment(categoryId: number, topicId: number, commentId: number) {

    }










    private getTopicCollName(catId: number): string {
        return `${ForumDataDB.catsCollName}/${ForumDataDB.catsDocNamePrefix}${catId}/${ForumDataDB.topicsCollName}`;
    }

    private getTopicDocName(topicId: number): string {
        return `${ForumDataDB.topicDocNamePrefix}${topicId}`;
    }

    private getCommentCollName(catId: number, topicId: number): string {
        return `${ForumDataDB.catsCollName}/${ForumDataDB.catsDocNamePrefix}${catId}/${ForumDataDB.topicsCollName}/${ForumDataDB.topicDocNamePrefix}${topicId}/${ForumDataDB.commentsCollName}`;
    }

    private getCommentDocName(commId: number): string {
        return `${ForumDataDB.commentDocNamePrefix}${commId}`
    }
}