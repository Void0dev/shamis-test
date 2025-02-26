export function truthy<T>(obj: T | undefined | null | false | 0): obj is T {
    return Boolean(obj);
}
