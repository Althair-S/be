import { Request, Response } from "express";
import * as yup from "yup";

import UserModel from "../models/user.model";

type TRegister = {
    fullname: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
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
                data : result,
            });
        } catch (error) {
            const err = error as unknown as Error;
            res.status(400).json({
                message: err.message,
            });
        }
    },
};
