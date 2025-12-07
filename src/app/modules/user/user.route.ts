import express, { NextFunction, Request, Response } from "express";
import { UserController } from "./user.controller";
import { fileUploader } from "../../helpers/fileUploader";
import { UserValidation } from "./user.validation";

const router = express.Router();

router.post(
  "/create-user",
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = UserValidation.createUserValidationSchema.parse(JSON.parse(req.body.data));
    next();
  },
  UserController.createUser
);

router.post(
    "/create-host",
    // auth(UserRole.SUPER_ADMIN), // optional auth
    fileUploader.upload.single('file'),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = UserValidation.createHostValidationSchema.parse(JSON.parse(req.body.data));
        return UserController.createHost(req, res, next);
    }
);

export const UserRoutes = router;
