import express, { NextFunction, Request, Response } from "express";
import { UserController } from "./user.controller";
import { fileUploader } from "../../helpers/fileUploader";
import { UserValidation } from "./user.validation";

const router = express.Router();

router.post(
  "/create-user",
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = UserValidation.createUserSchema.parse(JSON.parse(req.body.data));
    next();
  },
  UserController.createUser
);

export const UserRoutes = router;
