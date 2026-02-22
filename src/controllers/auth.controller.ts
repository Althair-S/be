import { Request, Response } from "express";
import * as yup from "yup";
import UserModel, { userDTO, userLoginDTO, userUpdatePasswordDTO } from "../models/user.model";
import { encrypt } from "../utils/encryption";
import { IReqUser } from "../utils/interface";
import { generateToken } from "../utils/jwt";
import response from "../utils/response";

export default {

    async updateProfile(req: IReqUser, res: Response) {
        try {
            const userId = req.user?.id;
            const { fullName, profilePicture } = req.body;
            const result = await UserModel.findByIdAndUpdate(userId, 
                {fullName, profilePicture}, 
                {new : true});

            if (!result) return response.notFound(res, "User not found");
            
            response.success(res, result, "Update Profile Success");
        } catch (error) {
            response.error(res, error, "Update Profile Failed")
        }
    },

    async updatePassword(req: IReqUser, res: Response) {
        try {
            const userId = req.user?.id;
            const { oldPassword, password, confirmPassword } = req.body;
            await userUpdatePasswordDTO.validate({
                oldPassword,
                password,
                confirmPassword,
            });

            const user = await UserModel.findById(userId);
            if (!user || user.password !== encrypt(oldPassword)) 
                return response.notFound(res, "User not found");

            const result = await UserModel.findByIdAndUpdate(userId, 
                {password : encrypt(password)}, 
                {new : true});
            
            response.success(res, result, "Update Password Success");
        } catch (error) {
            response.error(res, error, "Update Password Failed")
        }
    },

    async register(req: Request, res: Response) {
        const { fullName, username, email, password, confirmPassword } = req.body;

        try {
            await userDTO.validate({
                fullName,
                username,
                email,
                password,
                confirmPassword,
            });

            const result = await UserModel.create({
                fullName,
                username,
                email,
                password,
            });

            response.success(res, result, "User registered successfully");
        } catch (error) {
            const err = error as unknown as Error;
            response.error(res, err, "User registered failed");
        }
    },

    async login(req: Request, res: Response) {
        try {
            const { identifier, password } = req.body;
            await userLoginDTO.validate({
                identifier,
                password,
            });
            const userByIdentifier = await UserModel.findOne({
                $or: [
                    { email: identifier, },
                    { username: identifier, },
                ],
                isActive : true,
            });
            if (!userByIdentifier) {
                return response.unauthorized(res, "User not found");
            }
            // validasi password
            const validatePassword : boolean = encrypt(password) === userByIdentifier.password;
            if (!validatePassword) {
                return response.unauthorized(res, "User not found");
            }

            const token = generateToken({
                id: userByIdentifier._id,
                role: userByIdentifier.role,
                createdAt: userByIdentifier.createdAt,
            });

            response.success(res, token, "User Login Success");

        } catch (error) {
            const err = error as unknown as Error;
            response.error(res, err, "User Login Failed");
        }
    },

    async me(req: IReqUser, res:Response) {
        try {
            const user = req.user;
            const result = await UserModel.findById(user?.id);

            response.success(res, result, "Success Get User Profile");
        } catch (error) {
            const err = error as unknown as Error;
            response.error(res, err, "Failed Get User Profile");
        }
    },

    async activation (req: Request, res:Response) {
        try {
            const { code } = req.body as { code:string };

            const user = await UserModel.findOneAndUpdate({
                activationCode : code,
            }, {
                isActive : true,
            }, {
                new : true,
            });
            response.success(res, user, "User Activated Successfully");
        } catch (error) {
            const err = error as unknown as Error;
            response.error(res, err, "User Activated Failed");
        }
    }
};