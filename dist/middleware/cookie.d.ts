export = cookies;
/**
 * Adds `cookie` and `clearCookie` function on `res.cookie` to set cookies for response
 */
declare function cookies(handler: any): (req: any, res: any) => any;
