import { UserRole } from "@prisma/client";
import express, { NextFunction, Request, Response } from "express";
import { fileUploader } from "../../helpers/fileUploader";
import roleBasedAuth from "../../middlewares/roleBasedAuth";
import { UserController } from "./user.controller";
import { UserValidation } from "./user.validation";

const router = express.Router();
// Get all User
router.get("/",
    roleBasedAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN), // Only access for ADMIN & SUPER_ADMIN
    UserController.getAllFromDB
)

// Get My Profile
router.get('/me',
    roleBasedAuth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HOST, UserRole.USER),
    UserController.getMyProfile
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
    // roleBasedAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN), // Only access for ADMIN & SUPER_ADMIN
    fileUploader.upload.single('file'),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = UserValidation.createHostValidationSchema.parse(JSON.parse(req.body.data));
        return UserController.createHost(req, res, next);
    }
);

router.post("/create-admin",
    // roleBasedAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN), // Only access for ADMIN & SUPER_ADMIN
    fileUploader.upload.single('file'),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = UserValidation.createAdminValidationSchema.parse(JSON.parse(req.body.data));
        return UserController.createAdmin(req, res, next);
    }
);

router.patch("/update-my-profile",
    roleBasedAuth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HOST, UserRole.USER),
    fileUploader.upload.single('file'),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = JSON.parse(req.body.data)
        return UserController.updateMyProfie(req, res, next)
    }
);

// Hard Delete User (Permanent)
router.delete(
  "/:id",
  roleBasedAuth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HOST, UserRole.USER),
  UserController.deleteUser
);

// Soft Delete User
router.delete(
  "/soft/:id",
  roleBasedAuth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HOST, UserRole.USER),
  UserController.softDeleteUser
);


export const UserRoutes = router;
