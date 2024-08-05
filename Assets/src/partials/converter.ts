import { map, isArray, isObject } from 'underscore';

const toCamelCase = (str: string): string => {
    return str.replace(/([-_][a-z])/gi, (match) => {
        return match.toUpperCase().replace('-', '').replace('_', '');
    });
};

export const convertKeysToCamelCase = <T>(obj: any): T => {
    if (isArray(obj)) {
        return map(obj, item => convertKeysToCamelCase(item)) as unknown as T;
    } else if (isObject(obj) && obj !== null) {
        const newObj: { [key: string]: any } = {};
        Object.keys(obj).forEach(key => {
            const camelCaseKey = toCamelCase(key);
            newObj[camelCaseKey] = convertKeysToCamelCase(obj[key]);
        });
        return newObj as T;
    }
    return obj as T;
}
