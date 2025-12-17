import { UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import config from "../../../config";
import { jwtHelper } from "../../helpers/jwtHelpers";
import prisma from "../../shared/prisma";
import { Secret } from "jsonwebtoken";

const login = async (payload: { email: string, password: string }) => {
    const user = await prisma.user.findUniqueOrThrow({
        where: {
            email: payload.email,
            status: UserStatus.ACTIVE
        }
    })

    const isCorrectPassword = await bcrypt.compare(payload.password, user.password);
    if (!isCorrectPassword) {
        throw new Error("Password is incorrect!")
    }

    const accessToken = jwtHelper.generateToken({ email: user.email, role: user.role }, config.jwt.jwt_secret as string, config.jwt.expires_in as string);

    const refreshToken = jwtHelper.generateToken({ email: user.email, role: user.role }, config.jwt.refresh_token_secret as string, config.jwt.refresh_token_expires_in as string);
    

    return {
        accessToken,
        refreshToken,
        needPasswordChange: user.needPasswordChange
    }
}

const getMe = async (user: any) => {
    const accessToken = user.accessToken;
    const decodedData = jwtHelper.verifyToken(accessToken, config.jwt.jwt_secret as Secret);

    const userData = await prisma.user.findUniqueOrThrow(
        {
        where: {
            email: decodedData.email,
            status: UserStatus.ACTIVE
        },
        // select: {
        //     id: true,
        //     email: true,
        //     role: true,
        //     needPasswordChange: true,
        //     status: true,
        //     createdAt: true,
        //     updatedAt: true,
        //     admin: {
        //         select: {
        //             id: true,
        //             name: true,
        //             email: true,
        //             profilePhoto: true,
        //             contactNumber: true,
        //             isDeleted: true,
        //             createdAt: true,
        //             updatedAt: true,
        //         }
        //     },
        //     doctor: {
        //         select: {
        //             id: true,
        //             name: true,
        //             email: true,
        //             profilePhoto: true,
        //             contactNumber: true,
        //             address: true,
        //             registrationNumber: true,
        //             experience: true,
        //             gender: true,
        //             appointmentFee: true,
        //             qualification: true,
        //             currentWorkingPlace: true,
        //             designation: true,
        //             averageRating: true,
        //             isDeleted: true,
        //             createdAt: true,
        //             updatedAt: true,
        //             doctorSpecialties: {
        //                 include: {
        //                     specialities: true
        //                 }
        //             }
        //         }
        //     },
        //     patient: {
        //         select: {
        //             id: true,
        //             name: true,
        //             email: true,
        //             profilePhoto: true,
        //             contactNumber: true,
        //             address: true,
        //             isDeleted: true,
        //             createdAt: true,
        //             updatedAt: true,
        //             patientHealthData: true,
        //         }
        //     }
        // }
    }
);

    return userData;
}

export const AuthService = {
    login,
    getMe
}