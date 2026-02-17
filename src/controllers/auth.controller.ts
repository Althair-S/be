import { Request, Response } from "express";
import * as yup from "yup";

import UserModel from "../models/user.model";
import { encrypt } from "../utils/encryption";

type TRegister = {
    fullname: string;
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
    fullname: yup.string().required(),
    username: yup.string().required(),
    email: yup.string().required(),
    password: yup.string().required(),
    confirm_password: yup.string().required().oneOf([yup.ref("password")], "Passwords not match"),
});

export default {
    async register(req: Request, res: Response) {
        const { fullname, username, email, password, confirmPassword } =
            req.body as unknown as TRegister;

        try {
            await registerValidateSchema.validate({
                fullname,
                username,
                email,
                password,
                confirmPassword,
            });

            const result = await UserModel.create({
                fullname,
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
                    message: "User not found",
                    data: null,
                });
            }
            // validasi password
            const validatePassword : boolean = encrypt(password) === userByIdentifier.password;
            if (!validatePassword) {
                return res.status(403).json({
                    message: "user not found",
                    data: null,
                });
            }

            res.status(200).json({
                message: "User Login Success",
                data: userByIdentifier,
            });

        } catch (error) {
            const err = error as unknown as Error;
            res.status(400).json({
                message: err.message,
                data: null,
            });
        }
    },
};
