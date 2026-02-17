import { Request, Response } from "express";
import * as yup from "yup";
import UserModel from "../models/user.model";
import { encrypt } from "../utils/encryption";
import { Types } from "mongoose";
import { IReqUser } from "../middlewares/auth.middleware";
import { generateToken } from "../utils/jwt";

type TRegister = {
    fullName: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
};

type TLogin = {
    identifier: string;
    password: string;
};

const registerValidateSchema = yup.object({
    fullName: yup.string().required(),
    username: yup.string().required(),
    email: yup.string().required(),
    password: yup.string().required(),
    confirmPassword: yup.string().required().oneOf([yup.ref("password")], "Passwords not match"),
});

export default {
    async register(req: Request, res: Response) {
        const { fullName, username, email, password, confirmPassword } =
            req.body as unknown as TRegister;

        try {
            await registerValidateSchema.validate({
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

            res.status(200).json({
                message: "User registered successfully",
                data: result,
            });
        } catch (error) {
            const err = error as unknown as Error;
            res.status(400).json({
                message: err.message,
            });
        }
    },

    async login(req: Request, res: Response) {
        /**
        #swagger.requestBody = {
            required: true,
            schema: { $ref: "#/components/schemas/LoginRequest" }
        }
         */
        const { identifier, password } =
            req.body as unknown as TLogin;

        try {
            //Ambil data user berdasarkan "identifier" -> email & username
            const userByIdentifier = await UserModel.findOne({
                $or: [
                    { email: identifier, },
                    { username: identifier, },
                ],
            });
            if (!userByIdentifier) {
                return res.status(403).json({
                    message : "User not found",
                    data    : null,
                });
            }
            // validasi password
            const validatePassword : boolean = encrypt(password) === userByIdentifier.password;
            if (!validatePassword) {
                return res.status(403).json({
                    message : "user not found",
                    data    : null,
                });
            }

            const token = generateToken({
                id: userByIdentifier._id,
                role: userByIdentifier.role,
            });

            res.status(200).json({
                message : "User Login Success",
                data    : token,
            });

        } catch (error) {
            const err = error as unknown as Error;
            res.status(400).json({
                message : err.message,
                data    : null,
            });
        }
    },

    async me(req: IReqUser, res:Response) {
        /**
        #swagger.security = [{"bearerAuth": []}]
         */
        try {
            const user = req.user;
            const result = await UserModel.findById(user?.id);

            res.status(200).json({
                message : "Success Get User Profile",
                data    : result,
            });
        } catch (error) {
            const err = error as unknown as Error;
            res.status(400).json({
                message : err.message,
                data    : null,
            });
        }
    },
};