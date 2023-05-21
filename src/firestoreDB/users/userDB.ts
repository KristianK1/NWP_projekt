import { IAuthToken, IUser } from '../../models/basicModels';
import { getMaxIds } from '../MaxIDs/MaxIDs';
import { ILoginResponse } from '../../models/API/loginRegisterReqRes';
import { v4 as uuid } from 'uuid';
import { ISOToUNIX, addDaysToCurrentTime, getCurrentTimeISO, getCurrentTimeUNIX, hasTimePASSED } from '../../generalStuff/timeHandlers';
import { firestoreSingletonFactory, getMaxIDSingletonFactory } from '../singletonService';
import { FirestoreDB } from 'firestoreDB/firestore';
import { EmailService, emailServiceSingletonFactory } from '../../emailService/emailService';
import { IEmailConfirmationData, IForgotPasswordData } from 'emailService/emailModels';
var userDBObj: UsersDB;

export function createUserDBInstance() {
    userDBObj = new UsersDB();
}

export function getUserDBInstance(): UsersDB {
    return userDBObj;
}
export class UsersDB {

    static usersCollName = 'users';
    static authTokenCollName = 'authTokens';
    static emailConfirmationsCollName = 'emailConfirmations';
    static forgetPasswordRequestsCollName = 'forgotPasswords';
    

    firestore: FirestoreDB;
    getMaxIds: getMaxIds;
    emailService: EmailService;
    constructor() {
        this.firestore = firestoreSingletonFactory.getInstance();
        this.getMaxIds = getMaxIDSingletonFactory.getInstance();
        this.emailService = emailServiceSingletonFactory.getInstance();
    }

    async getUsers(): Promise<IUser[]> {
        let users: IUser[] = await this.firestore.getCollectionData(UsersDB.usersCollName);
        return users;
    }

    async getTokens(): Promise<IAuthToken[]> {
        return await this.firestore.getCollectionData(UsersDB.authTokenCollName);
    }

    async getUserbyId(id: number): Promise<IUser> {
        let user: IUser = await this.firestore.getDocumentData(UsersDB.usersCollName, `${id}`);
        if (!user) throw ({ message: 'User doesn\'t exist' });
        return user;
    }

    async loginUserByCreds(username: string, password: string): Promise<ILoginResponse> {
        var users = await this.getUsers();
        const user = users.find(user => user.username === username);
        if (!user) {
            throw ({ message: 'User doesn\'t exist' });
        }
        if(user.password !== password){
            throw ({ message: 'Wrong password' });
        }
        let loginResponse = {} as ILoginResponse;
        loginResponse.username = user.username;
        loginResponse.id = user.id;
        loginResponse.email = user.email;

        const newAuthToken = uuid().replace('-', '');
        const authToken: IAuthToken = {} as IAuthToken;

        authToken.authToken = newAuthToken;
        authToken.userId = user.id;
        authToken.validUntil = addDaysToCurrentTime(30);
        loginResponse.authToken = newAuthToken;
        await this.firestore.setDocumentValue(UsersDB.authTokenCollName, newAuthToken, authToken);
        return loginResponse;
    }

    async getUserByToken(token: string, updateTokenTime: boolean): Promise<IUser> {
        let authTokenDB: IAuthToken = await this.firestore.getDocumentData(UsersDB.authTokenCollName, token);
        if (!authTokenDB) {
            throw ({ message: 'Couldn\'t find token' });
        }
        if (hasTimePASSED(authTokenDB.validUntil)) {
            throw ({ message: 'Token expired' });
        }
        const user = await this.getUserbyId(authTokenDB.userId);
        if (!user) {
            throw ({ message: 'User doesn\'t exist' });
        }

        if (updateTokenTime) {
            await this.firestore.updateDocumentValue(UsersDB.authTokenCollName, token, {
                validUntil: addDaysToCurrentTime(30)
            });
        }
        return user;
    }

    async getUserbyEmail(email: string): Promise<IUser> {
        let users: IUser[] = await this.getUsers();
        let user = users.find(user => user.email === email);
        if (!user) throw ({ message: 'User doesn\'t exist' });
        return user;
    }

    async getUserbyName(username: string): Promise<IUser> {
        let users: IUser[] = await this.getUsers();
        let user = users.find(user => user.username === username);
        if (!user) throw ({ message: 'User doesn\'t exist' });
        return user;
    }

    async removeToken(token: string) {
        let authTokenDB: IAuthToken = await this.firestore.getDocumentData(UsersDB.authTokenCollName, token);
        if (!authTokenDB) {
            throw ({ message: 'Couldn\'t find token' });
        }
        await this.firestore.deleteDocument(UsersDB.authTokenCollName, token);
    }

    async removeAllMyTokens(dontRemoveToken: string) {
        let authTokenDB: IAuthToken = await this.firestore.getDocumentData(UsersDB.authTokenCollName, dontRemoveToken);
        if (!authTokenDB) {
            throw ({ message: 'Couldn\'t find token' });
        }
        const allAuthTokens: IAuthToken[] = await this.firestore.getCollectionData(UsersDB.authTokenCollName);
        allAuthTokens.forEach(async token => { //TODO maybe regular for loop
            if (token.userId == authTokenDB.userId && token.authToken !== dontRemoveToken) {
                await this.firestore.deleteDocument(UsersDB.authTokenCollName, `${token.authToken}`);
            }
        })
    }

    async addUser(username: string, password: string, email: string): Promise<number> {
        var users = await this.getUsers();
        var sameNameUser = users.find(user => user.username === username);
        if (sameNameUser) throw ({ message: 'User with same name exists' });
        
        if(email){
            let sameEmailUser = users.find(user => user.email === email);
            console.log(sameEmailUser);
            if(sameEmailUser) throw ({ message: 'User with same email exists' });
        }
    var maxIDdoc = await this.getMaxIds.getMaxUserId(true);

        var newUser: IUser = {
            id: maxIDdoc + 1,
            password: password,
            username: username,
            email: email,
            userRight: { rightsToDevices: [], rightsToGroups: [], rightsToFields: [], rightsToComplexGroups: [] },
        }

        if(email !== ""){
            await this.sendEmailConfirmation_registration(newUser.id, newUser.username, email);
        }

        await this.firestore.setDocumentValue(UsersDB.usersCollName, `${newUser.id}`, newUser);
        return newUser.id;
    }

    async changeUserPassword(id: number, oldP: string, newP: string) {
        let user = await this.getUserbyId(id);
        if (user.password !== oldP) {
            throw ({ message: 'Wrong password' });
        }
        await this.firestore.updateDocumentValue(UsersDB.usersCollName, `${id}`, { password: newP });
    }

    async changeUsername(id: number, username: string) {
        let user = await this.getUserbyId(id);
        if (!user) {
            throw ({ message: 'User doesn\'t exist in database' });
        }
        user.username = username;
        await this.firestore.updateDocumentValue(UsersDB.usersCollName, `${id}`, user);
    }

    async deleteUser(token: string) {
        let user = await this.getUserByToken(token, false);
        if (!user) {
            throw ({ message: 'User doesn\'t exist in database' });
        }
        await this.firestore.deleteDocument(UsersDB.usersCollName, `${user.id}`);

        let tokens = await this.getTokens();
        tokens.forEach(async token => {
            if (token.userId === user.id) {
                await this.firestore.deleteDocument(UsersDB.authTokenCollName, token.authToken);
            }
        });
    }
    
    private async sendEmailConfirmation_registration(id: number, username: String, email: string) {
        let hashCode = uuid();
        await this.emailService.sendRegistrationEmail(username, email, hashCode);

        let emailConfirmationData: IEmailConfirmationData = {
            userId: id,
            hashCode: hashCode,
            email: email,
        }
        await this.firestore.setDocumentValue(UsersDB.emailConfirmationsCollName, hashCode, emailConfirmationData);        
    }

    async sendEmailConfirmation_addEmail(id: number, username: String, email: string) {
        let hashCode = uuid();
        await this.emailService.sendAddEmailEmail(username, email, hashCode);

        let emailConfirmationData: IEmailConfirmationData = {
            userId: id,
            hashCode: hashCode,
            email: email,
        }
        let confirmations: IEmailConfirmationData[] = await this.firestore.getCollectionData(UsersDB.emailConfirmationsCollName);
        for(let confirmation of confirmations){
            if(confirmation.email === email){
                await this.firestore.deleteDocument(UsersDB.emailConfirmationsCollName, confirmation.hashCode);
            }
        }
        await this.firestore.setDocumentValue(UsersDB.emailConfirmationsCollName, hashCode, emailConfirmationData);   
    }

    async getEmailConfirmationData(hashCode: string): Promise<IEmailConfirmationData>{
        let data: IEmailConfirmationData[] = await this.firestore.getCollectionData(UsersDB.emailConfirmationsCollName);
        let findCode = data.find(o => o.hashCode === hashCode);
        if(findCode) return findCode;
        throw {message: 'Can\'t find email confirmation'};
    }

    async confirmEmail(hashCode: string){
        let data: IEmailConfirmationData[] = await this.firestore.getCollectionData(UsersDB.emailConfirmationsCollName);
        console.log(data);

        let findCode = data.find(o => o.hashCode === hashCode);
        if(findCode){

            let users = await this.getUsers();
            let sameEmailUser = users.find(user => user.email === findCode?.email);
            if(sameEmailUser) throw({message: 'Email was already confirmed for a different user'});

            if(await this.getUserbyId(findCode.userId)){
                await this.firestore.updateDocumentValue(UsersDB.usersCollName, `${findCode.userId}`, { email: findCode.email });
                await this.firestore.deleteDocument(UsersDB.emailConfirmationsCollName, findCode.hashCode);

                for(let confirmation of data){
                    if(confirmation.email === findCode.email){
                        await this.firestore.deleteDocument(UsersDB.emailConfirmationsCollName, confirmation.hashCode);
                    }
                }
            }
            else{
                throw({message: 'User doesn\'t exist'});
            }
        }
        else{
            throw({message: 'Invalid email confirmation code'});
        }
    }

    async createForgotPasswordRequest(userId: number, username: string, email: string) {
        let request: IForgotPasswordData = {
            userId: userId,
            hashCode: uuid(),
            timeStamp: getCurrentTimeISO(),
        }
        await this.emailService.sendForgotPasswordEmail(username, email, request.hashCode);
        await this.firestore.setDocumentValue(UsersDB.forgetPasswordRequestsCollName, `${request.userId}`, request);
    }

    async getForgotPasswordRequest(hashCode: string): Promise<IForgotPasswordData>{
        let datas: IForgotPasswordData[] = await this.firestore.getCollectionData(UsersDB.forgetPasswordRequestsCollName);
        let data = datas.find(o => o.hashCode === hashCode);
        if(data == null){
            throw({message: 'Can\'t find it'});
        }
        return data;
    }

    async changePasswordViaForgetPasswordRequest(hashCode: string, newPassword: string){
        let reqs: IForgotPasswordData[] = await this.firestore.getCollectionData(UsersDB.forgetPasswordRequestsCollName);
        let req = reqs.find( o => o.hashCode === hashCode);
        if(req == null){
            throw({message: "Can't find the change password request"});
        }

        if(getCurrentTimeUNIX() - ISOToUNIX(req.timeStamp) > 1000 * 60 * 15){ //15 minutes
            throw({message: "Expired"});
        }
        
        await this.firestore.updateDocumentValue(UsersDB.usersCollName, `${req.userId}`, { password: newPassword });
        await this.firestore.deleteDocument(UsersDB.forgetPasswordRequestsCollName, `${req.userId}`);
    }
}