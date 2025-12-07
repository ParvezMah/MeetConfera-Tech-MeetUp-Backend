import { UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import config from "../../../config";
import { jwtHelper } from "../../helpers/jwtHelpers";
import prisma from "../../shared/prisma";

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

export const AuthService = {
    login
}