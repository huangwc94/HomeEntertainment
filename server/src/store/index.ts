const store: { [id: string]: any } = {};

export function save(id: string, data: any) {
    store[id] = data;
}

export function read(id: string): any {
    if (id in store) {
        return store[id];
    }
    return {};
}
