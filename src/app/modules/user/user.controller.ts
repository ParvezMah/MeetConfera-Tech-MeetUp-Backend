import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { UserService } from "./user.service";
import sendResponse from "../../shared/sendResponse";

const createUser = catchAsync(async (req: Request, res: Response) => {
    console.log("create user : ", req.body);

    const result = await UserService.createUser(req);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "User created successfully!",
        data: result
    })
});

const createHost = catchAsync(async (req: Request, res: Response) => {
    const result = await UserService.createHost(req);
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Host created successfully!",
        data: result
    });
});

const createAdmin = catchAsync(async (req: Request, res: Response) => {
    const result = await UserService.createAdmin(req);
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Admin created successfully!",
        data: result
    });
});

export const UserController = {
    createUser,
    createHost,
    createAdmin
};