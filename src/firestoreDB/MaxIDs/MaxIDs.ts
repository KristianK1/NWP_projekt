import { firestoreSingletonFactory } from '../singletonService';
import { FirestoreDB } from '../firestore';

var maxIDsObj: getMaxIds;

export function createMaxIDsInstance() {
    maxIDsObj = new getMaxIds();
}

export function getMaxIDsInstance(): getMaxIds {
    return maxIDsObj;
}

export class getMaxIds {

    private maxIDsCollName = 'maxIDs';

    private userKey = 'user';
    private deviceKey = 'device';
    private fieldGroupKey = 'fieldGroup';
    private fieldKey = 'field';

    firestore: FirestoreDB;
    constructor() {
        this.firestore = firestoreSingletonFactory.getInstance();
    }

    async getMaxUserId(autoIncrement: boolean): Promise<number> {return await this.getMax(this.userKey, autoIncrement)}
    async setMaxUserId(id: number) { await this.setMax(this.userKey, id) }

    async getMaxDeviceId(autoIncrement: boolean): Promise<number> { return await this.getMax(this.deviceKey, autoIncrement) }
    async setMaxDeviceId(id: number) { await this.setMax(this.deviceKey, id) }

    async getMaxFieldGroupId(autoIncrement: boolean): Promise<number> { return await this.getMax(this.fieldGroupKey, autoIncrement) }
    async setMaxFieldGroupId(id: number) { await this.setMax(this.fieldGroupKey, id) }

    async getMaxFieldId(autoIncrement: boolean): Promise<number> { return await this.getMax(this.fieldKey, autoIncrement) }
    async setMaxFieldId(id: number) { await this.setMax(this.fieldKey, id) }


    private async getMax(key: string, autoIncrement?: boolean): Promise<number> {
        let maxId: number;
        try{
            maxId = (await this.firestore.getDocumentData(this.maxIDsCollName, key)).max
        }
        catch{
            maxId = 0;
        }
        if (autoIncrement) {
            await this.setMax(key, maxId + 1);
        }
        return maxId;
    }

    private async setMax(key: string, id: number) {
        return await this.firestore.setDocumentValue(this.maxIDsCollName, key, { max: id });
    }
}