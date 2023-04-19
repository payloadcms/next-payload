export = authMiddleware;
declare function authMiddleware(handler: any): (req: any, res: any) => import("express").NextFunction;
