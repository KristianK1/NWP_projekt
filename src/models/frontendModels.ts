
export interface IWSSMessageForUser {
    messageType: 'userMessage' | 'deviceData' | 'deviceDeleted' | 'lostRightsToDevice',
    data: ILoggedReason //| IDeviceForUser[] | IDeviceDeleted | IDeviceForUserFailed
}

export interface ILoggedReason {
    logoutReason: ELogoutReasons
}

export enum ELogoutReasons {
    DeletedUser,
    ChangedPassword,
    LogoutAll,
    LogoutMyself //no toast on frontend
}