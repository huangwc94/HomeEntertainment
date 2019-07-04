export enum SocketEvent {
    SERVER_FULL_STATE_UPDATE = 'SERVER_UPDATE',
    SERVER_ACTION = 'SERVER_ACTION',
    CLIENT_ACTION = 'CLIENT_ACTION',
    CLIENT_LOGIN = 'CLIENT_LOGIN',
    CLIENT_READY = 'CLIENT_READY',
    DISCONNECT = 'disconnect',
    CONNECT = 'connect',
    NOTIFICATION = 'NOTIFICATION',
}

export enum ConnectType {
    SCREEN,
    CONTROLLER,
}

export enum NotificationType {
    SUCCESS,
    INFO,
    WARNING,
    ERROR,
}

export interface INotification {
    type: NotificationType;
    message: string;
}

export interface ILoginCredential {
    name: string;
    token: string;
    type: ConnectType;
    data: string;
}

export interface IInputAction {
    type: string;
    payload: any;
}

