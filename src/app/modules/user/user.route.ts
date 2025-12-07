import express, { NextFunction, Request, Response } from "express";
import { UserController } from "./user.controller";
import { fileUploader } from "../../helpers/fileUploader";
import { UserValidation } from "./user.validation";
import roleBasedAuth from "../../middlewares/roleBasedAuth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.get(
    "/",
    roleBasedAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN), // Only access for ADMIN & SUPER_ADMIN
    UserController.getAllFromDB
)


router.post("/create-user",
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = UserValidation.createUserValidationSchema.parse(JSON.parse(req.body.data));
    next();
  },
  UserController.createUser
);

router.post("/create-host",
    roleBasedAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN), // Only access for ADMIN & SUPER_ADMIN
    fileUploader.upload.single('file'),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = UserValidation.createHostValidationSchema.parse(JSON.parse(req.body.data));
        return UserController.createHost(req, res, next);
    }
);

router.post("/create-admin",
    roleBasedAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN), // Only access for ADMIN & SUPER_ADMIN
    fileUploader.upload.single('file'),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = UserValidation.createAdminValidationSchema.parse(JSON.parse(req.body.data));
        return UserController.createAdmin(req, res, next);
    }
);

export const UserRoutes = router;
