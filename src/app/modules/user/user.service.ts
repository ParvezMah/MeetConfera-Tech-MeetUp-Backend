import bcrypt from "bcryptjs";
import { Request } from "express";
import config from "../../../config";
import { fileUploader } from "../../helpers/fileUploader";
import prisma from "../../shared/prisma";
import { Admin, Host, Prisma, UserRole } from "@prisma/client";
import { paginationHelper } from "../../helpers/paginationHelper";
import { userSearchableFields } from "./user.constant";

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

const createHost = async (req: Request): Promise<Host> => {
    if (req.file) {
        const uploaded = await fileUploader.uploadToCloudinary(req.file);
        req.body.host.profilePhoto = uploaded?.secure_url;
    }

    const hashedPassword = await bcrypt.hash(req.body.password, Number(config.salt_round));

    const result = await prisma.$transaction(async (tx) => {
        await tx.user.create({
            data: {
                email: req.body.host.email,
                password: hashedPassword,
                role: UserRole.HOST,
                contactNumber: req.body.host.contactNumber
            },
        });

        const createdHost = await tx.host.create({
            data: req.body.host,
        });

        return createdHost;
    });

    return result;
};

const createAdmin = async (req: Request): Promise<Admin> => {
    if (req.file) {
        const uploaded = await fileUploader.uploadToCloudinary(req.file);
        req.body.admin.profilePhoto = uploaded?.secure_url;
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const result = await prisma.$transaction(async (tx) => {
        await tx.user.create({
            data: {
                email: req.body.admin.email,
                password: hashedPassword,
                role: UserRole.ADMIN,
                contactNumber: req.body.admin.contactNumber
            },
        });

        const createdAdmin = await tx.admin.create({
            data: req.body.admin,
        });

        return createdAdmin;
    });

    return result;
};

const getAllFromDB = async (params: any, options: any) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options)
    const { searchTerm, ...filterData } = params;

    const andConditions: Prisma.UserWhereInput[] = [];

    // Searching
    if (searchTerm) {
        andConditions.push({
            OR: userSearchableFields.map(field => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive"
                }
            }))
        })
    }

    // Filtering
    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map(key => ({
                [key]: {
                    equals: (filterData as any)[key]
                }
            }))
        })
    }

    console.log(andConditions)

    const whereConditions: Prisma.UserWhereInput = andConditions.length > 0 ? {
        AND: andConditions
    } : {}

    const result = await prisma.user.findMany({
        // Pagination
        skip, 
        take: limit,
        // Searching
        where : {
            AND: whereConditions
        },
        // Sorting
        orderBy: {
            [sortBy]: sortOrder
        }
    });

    const total = await prisma.user.count({
        where: whereConditions
    });

    return {
        meta: {
            page,
            limit,
            total
        },
        data: result
    };
}

export const UserService = {
  createUser,
  createHost,
  createAdmin,
  getAllFromDB
};
