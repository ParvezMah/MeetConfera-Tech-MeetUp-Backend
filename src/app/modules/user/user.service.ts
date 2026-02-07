import { Admin, Host, Prisma, UserRole, UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Request } from "express";
import config from "../../../config";
import { fileUploader } from "../../helpers/fileUploader";
import { paginationHelper } from "../../helpers/paginationHelper";
import prisma from "../../shared/prisma";
import { IAuthUser } from "../../types/common";
import { userSearchableFields } from "./user.constant";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";


const createUser = async (req: Request) => {
  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: req.body.user.email }
  });

  if (existingUser) {
    throw new Error(`Email "${req.body.user.email}" is already registered`);
  }

  if (req.file) {
    try {
      const uploadResult = await fileUploader.uploadToCloudinary(req.file);
      req.body.user.profilePhoto = uploadResult?.secure_url;
    } catch (error) {
      console.error("Profile photo upload failed:", error);
      // Continue without profile photo, or throw error if required
    }
  }
  const hashPassword = await bcrypt.hash(
    req.body.password,
    Number(config.salt_round)
  );

  const result = await prisma.user.create({
    data: {
      name: req.body.user.name,
      email: req.body.user.email,
      password: hashPassword,
      contactNumber: req.body.user.contactNumber,
      profilePhoto: req.body.user.profilePhoto || null,
      location: req.body.user.location, 
    },
  });

  return result;
};

const createHost = async (req: Request): Promise<Host> => {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
        where: { email: req.body.host.email }
    });

    if (existingUser) {
        throw new Error(`Email "${req.body.host.email}" is already registered`);
    }

    if (req.file) {
        try {
            const uploaded = await fileUploader.uploadToCloudinary(req.file);
            req.body.host.profilePhoto = uploaded?.secure_url;
        } catch (error) {
            console.error("Profile photo upload failed:", error);
            // Continue without profile photo
        }
    }

    const hashedPassword = await bcrypt.hash(req.body.password, Number(config.salt_round));

    const result = await prisma.$transaction(async (tx) => {
        await tx.user.create({
            data: {
                name: req.body.host.name,
                email: req.body.host.email,
                password: hashedPassword,
                role: UserRole.HOST,
                contactNumber: req.body.host.contactNumber,
                location: req.body.location
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
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
        where: { email: req.body.admin.email }
    });

    if (existingUser) {
        throw new Error(`Email "${req.body.admin.email}" is already registered`);
    }

    if (req.file) {
        try {
            const uploaded = await fileUploader.uploadToCloudinary(req.file);
            req.body.admin.profilePhoto = uploaded?.secure_url;
        } catch (error) {
            console.error("Profile photo upload failed:", error);
            // Continue without profile photo
        }
    }

    const hashedPassword = await bcrypt.hash(req.body.password, Number(config.salt_round));

    const result = await prisma.$transaction(async (tx) => {
        await tx.user.create({
            data: {
                name: req.body.admin.name,
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

const getMyProfile = async (user: IAuthUser) => {
    const userInfo = await prisma.user.findUniqueOrThrow({
        where: {
            email: user?.email,
            status: UserStatus.ACTIVE,
        },
        select: {
            id: true,
            email: true,
            needPasswordChange: true,
            role: true,
            status: true,
        },
    });

    let profileInfo;

    if (userInfo.role === UserRole.SUPER_ADMIN) {
        profileInfo = await prisma.admin.findUnique({
            where: {
                email: userInfo.email,
            },
            select: {
                id: true,
                name: true,
                email: true,
                profilePhoto: true,
                contactNumber: true,
                isDeleted: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    } else if (userInfo.role === UserRole.ADMIN) {
        profileInfo = await prisma.admin.findUnique({
            where: {
                email: userInfo.email,
            },
            select: {
                id: true,
                name: true,
                email: true,
                profilePhoto: true,
                contactNumber: true,
                isDeleted: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    } else if (userInfo.role === UserRole.HOST) {
        profileInfo = await prisma.host.findUnique({
            where: {
                email: userInfo.email,
            },
            select: {
                id: true,
                name: true,
                email: true,
                profilePhoto: true,
                contactNumber: true,
                // location: true,
                averageRating: true,
                isDeleted: true,
                createdAt: true,
                updatedAt: true,
                events: true
            },
        });
    } else if (userInfo.role === UserRole.USER) {
        profileInfo = await prisma.participant.findFirst({
            where: {
                userId: userInfo.id,
            }
        });
    }

    return { ...userInfo, ...profileInfo };
};

const updateMyProfie = async (user: IAuthUser, req: Request) => {
    const userInfo = await prisma.user.findUniqueOrThrow({
        where: {
            email: user?.email,
            status: UserStatus.ACTIVE
        }
    });

    const file = req.file;
    if (file) {
        const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
        req.body.profilePhoto = uploadToCloudinary?.secure_url;
    }

    let profileInfo;

    if (userInfo.role === UserRole.SUPER_ADMIN) {
        profileInfo = await prisma.admin.update({
            where: {
                email: userInfo.email
            },
            data: req.body
        })
    }
    else if (userInfo.role === UserRole.ADMIN) {
        profileInfo = await prisma.admin.update({
            where: {
                email: userInfo.email
            },
            data: req.body
        })
    }
    else if (userInfo.role === UserRole.HOST) {
        profileInfo = await prisma.host.update({
            where: {
                email: userInfo.email
            },
            data: req.body
        })
    }
    else if (userInfo.role === UserRole.USER) {
        profileInfo = await prisma.participant.update({
            where: {
                id: userInfo.id
            },
            data: req.body
        })
    }

    return { ...profileInfo };
}

// Hard delete
const deleteUser = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  return prisma.user.delete({
    where: { id },
  });
};

// Soft delete
const softDeleteUser = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  return prisma.user.update({
    where: { id },
    data: {
      status: "DELETED",
    },
  });
};

export const UserService = {
  createUser,
  createHost,
  createAdmin,
  getAllFromDB,
  getMyProfile,
  updateMyProfie,
  deleteUser,
  softDeleteUser
};
