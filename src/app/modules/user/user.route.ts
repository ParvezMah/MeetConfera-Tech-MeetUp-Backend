import express, { NextFunction, Request, Response } from "express";
import { UserController } from "./user.controller";
import { fileUploader } from "../../helpers/fileUploader";
import { UserValidation } from "./user.validation";
import roleBasedAuth from "../../middlewares/roleBasedAuth";
import { UserRole } from "@prisma/client";
import { multerUpload } from "../../../config/multer.config";

const router = express.Router();
// Get all User
router.get(
    "/",
    roleBasedAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN), // Only access for ADMIN & SUPER_ADMIN
    UserController.getAllFromDB
)

// Get My Profile
router.get(
    '/me',
    roleBasedAuth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HOST, UserRole.USER),
    UserController.getMyProfile
)

// Create User Route
// router.post(
//   "/create-user",
//   multerUpload.single("file"), // "file" is the field name for profile photo
//   (req: Request, res: Response, next: NextFunction) => {
//     try {
//       // Parse JSON from FormData (if sent as "data" field)
//       const parsedBody = req.body.data ? JSON.parse(req.body.data) : req.body;

//       // Validate request
//       req.body = UserValidation.createUserValidationSchema.parse(parsedBody);

//       // Pass to controller
//       return UserController.createUser(req, res, next);
//     } catch (error) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid input",
//         error,
//       });
//     }
//   }
// );
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

router.patch(
    "/update-my-profile",
    roleBasedAuth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HOST, UserRole.USER),
    fileUploader.upload.single('file'),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = JSON.parse(req.body.data)
        return UserController.updateMyProfie(req, res, next)
    }
);

export const UserRoutes = router;
