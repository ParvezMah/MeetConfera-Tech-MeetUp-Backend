import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { UserService } from "./user.service";

const createUser = catchAsync(async (req: Request, res: Response) => {
    console.log("create user : ", req.body);

    const result = await UserService.createUser(req.body);

    res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: result
    });
});

export const UserController = {
    createUser
};