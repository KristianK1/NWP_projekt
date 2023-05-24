import { FirestoreDB } from "./firestore";
import { ForumDataDB } from "./forumData/forumDataDB";
import { getMaxIds } from "./MaxIDs/MaxIDs";
import { UsersDB } from "./users/userDB";

export const firestoreSingletonFactory = (function () {
    var firestoreInstance: FirestoreDB;

    function createInstance(): FirestoreDB {
        var object = new FirestoreDB();
        return object;
    }

    return {
        getInstance: function () {
            if (!firestoreInstance) {
                firestoreInstance = createInstance();
            }
            return firestoreInstance;
        }
    };
})();

export const usersDBSingletonFactory = (function () {
    var usersDB: UsersDB;

    function createInstance(): UsersDB {
        var object = new UsersDB();
        return object;
    }

    return {
        getInstance: function () {
            if (!usersDB) {
                usersDB = createInstance();
            }
            return usersDB;
        }
    };
})();

export const getMaxIDSingletonFactory = (function () {
    var getMaxIDs: getMaxIds;

    function createInstance(): getMaxIds {
        var object = new getMaxIds();
        return object;
    }

    return {
        getInstance: function () {
            if (!getMaxIDs) {
                getMaxIDs = createInstance();
            }
            return getMaxIDs;
        }
    };
})();

export const getForumDataDBSingletonFactory = (function () {
    var instance: ForumDataDB;

    function createInstance(): ForumDataDB {
        var object = new ForumDataDB();
        return object;
    }

    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();