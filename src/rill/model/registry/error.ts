
export abstract class RegistryError extends Error {
}

export class RegistryAlreadyExistsError extends Error {
    constructor(type: string, id: string) {
        super(`${type} with ID ${id} is already registered`);
    }
}

export class RegistryUnknownClassError extends Error {
    constructor(entityClass: string) {
        super(`Class ${entityClass} is unknown`);
    }
}
