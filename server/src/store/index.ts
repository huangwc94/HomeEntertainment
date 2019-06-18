const store: { [id: string]: any } = {};

export interface IUserInfo {
    id: string;
    name: string;
    avatar: string;
    cash: number;
}

export function save(id: string, data: any) {
    store[id] = data;
}

export function read(id: string): any {
    if (id in store) {
        return store[id];
    }
    return null;
}

export function saveUser(user: IUserInfo) {
    save(user.id, user);
}

export function readUser(id: string): IUserInfo | null {
    return read(id);
}

export function getStore(){
    return store;
}
