import bcrypt from "bcryptjs";
import { createUserInput } from "./user.interface"
import prisma from "../../shared/prisma";
import config from "../../../config";


const createUser = async (payload: createUserInput) => {
    const hashPassword = await bcrypt.hash(payload.password, Number(config.salt_round));

    const result = await prisma.user.create({
        data: {
            email: payload.email,
            password: hashPassword
        },
    });

    return result;
}

export const UserService = {
    createUser
};