declare function objectToQueryString(obj: any, parentKey?: string): string;
declare function stringToObject(str: any): {
    [key: string]: unknown;
};
export declare const qs: {
    parse: typeof stringToObject;
    stringify: typeof objectToQueryString;
};
export {};
