import { Request, Response } from "express";

import { AuthService } from "./auth.service";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";

const login = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.login(req.body);

    const { accessToken, refreshToken, needPasswordChange } = result;

    res.cookie("accessToken", accessToken, {
        secure: true,
        httpOnly: true,
        sameSite: "none",
        maxAge: 1000 * 60 * 60
    })
    res.cookie("refreshToken", refreshToken, {
        secure: true,
        httpOnly: true,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 90
    })

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "User logged in successfully!",
        data: {
            needPasswordChange
        }
    })
})

export const AuthController = {
    login
}