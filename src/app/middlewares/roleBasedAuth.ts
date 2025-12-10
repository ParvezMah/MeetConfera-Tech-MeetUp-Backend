import { NextFunction, Request, Response } from "express"
import { jwtHelper } from "../helpers/jwtHelpers";
import config from "../../config";


const roleBasedAuth = (...roles: string[]) => {
    return async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
        try {
            // const token = req.headers.accessToken || req.cookies.accessToken;
            const token = req.cookies.accessToken;

            if (!token) {
                throw new Error("You are not authorized to access this route!")
            }

            const verifyUser = jwtHelper.verifyToken(token, config.jwt.jwt_secret as string);

            req.user = verifyUser;

            if (roles.length && !roles.includes(verifyUser.role)) {
                throw new Error("You are not authorized to access this route!")
            }

            next();
        }
        catch (err) {
            next(err)
        }
    }
}

export default roleBasedAuth;