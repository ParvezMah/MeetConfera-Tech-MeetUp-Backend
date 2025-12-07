import bcrypt from "bcryptjs";
import { Request } from "express";
import config from "../../../config";
import { fileUploader } from "../../helpers/fileUploader";
import prisma from "../../shared/prisma";
import { UserRole } from "@prisma/client";

const createUser = async (req: Request) => {
  if (req.file) {
    const uploadResult = await fileUploader.uploadToCloudinary(req.file);
    req.body.user.profilePhoto = uploadResult?.secure_url;
  }
  const hashPassword = await bcrypt.hash(
    req.body.password,
    Number(config.salt_round)
  );

  const result = await prisma.user.create({
    data: {
      email: req.body.user.email,
      password: hashPassword,
      contactNumber: req.body.user.contactNumber,
      profilePhoto: req.body.user.profilePhoto || null,
      role: req.body.user.role || UserRole.USER,
    },
  });

  return result;
};

export const UserService = {
  createUser,
};
