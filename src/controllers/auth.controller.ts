import { Request, Response } from "express";
import * as yup from "yup";
import UserModel from "../models/user.model";
import { encrypt } from "../utils/encryption";
import { IReqUser } from "../utils/interface";
import { generateToken } from "../utils/jwt";
import response from "../utils/response";

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
    password: yup.string().required().min(6, "Password must be at least 6 characters").test("password", "Password must contain at least one uppercase letter and one number",
        (value) => {
            if (!value) return false;
            const regex = /^(?=.*[A-Z])(?=.*\d)/;
            return regex.test(value);
        }),
    confirmPassword: yup.string().required().oneOf([yup.ref("password")], "Passwords not match"),
});

export default {
    async register(req: Request, res: Response) {
        /**
        #swagger.tags = ["Auth"]
         */
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

            response.success(res, result, "User registered successfully");
        } catch (error) {
            const err = error as unknown as Error;
            response.error(res, err, "User registered failed");
        }
    },

    async login(req: Request, res: Response) {
        /**
        #swagger.tags = ["Auth"]
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
            });

            response.success(res, token, "User Login Success");

        } catch (error) {
            const err = error as unknown as Error;
            response.error(res, err, "User Login Failed");
        }
    },

    async me(req: IReqUser, res:Response) {
        /**
        #swagger.tags = ["Auth"]
        #swagger.security = [{"bearerAuth": []}]
         */
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
        /**
        #swagger.tags = ["Auth"]
        #swagger.requestBody = {
            required: true,
            schema: { $ref: "#/components/schemas/ActivationRequest" }
        }
         */
        try {
            const { code } = req.body as { code:string };

            const user = await UserModel.findOneAndUpdate({
                activationCode : code,
            }, {
                isActive : true,
            }, {
                new : true,
            }
        );
        response.success(res, user, "User Activated Successfully");
            
        } catch (error) {
            response.error(res, error, "User Activated Failed");
        }
    }
};