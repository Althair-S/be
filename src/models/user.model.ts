import mongoose from "mongoose";
import { encrypt } from "../utils/encryption";

import { renderMailHtml, sendMail } from "../utils/mail/mail";
import { CLIENT_HOST, EMAIL_SMTP_USER } from "../utils/env";
import { ROLES } from "../utils/constant";
import * as yup from "yup";

const validatePassword = yup.string().required().min(6, "Password must be at least 6 characters").test("password", "Password must contain at least one uppercase letter and one number",
        (value) => {
            if (!value) return false;
            const regex = /^(?=.*[A-Z])(?=.*\d)/;
            return regex.test(value);
        });
const validateConfirmPassword = yup.string().required().oneOf([yup.ref("password")], "Passwords not match");

export const USER_MODEL_NAME = "User";

export const userLoginDTO = yup.object({
    identifier : yup.string().required("Identifier is required"),
    password : validatePassword,
});

export const userUpdatePasswordDTO = yup.object({
    oldPassword : validatePassword,
    Password : validatePassword,
    confirmPassword : validateConfirmPassword,
});

export const userDTO = yup.object({
    fullName        : yup.string().required("Full name is required"),
    username        : yup.string().required("Username is required"),
    email           : yup.string().required("Email is required").email("Invalid email format"),
    password        : validatePassword,
    confirmPassword : validateConfirmPassword,
});

export type TypeUser = yup.InferType<typeof userDTO>;

export interface User extends Omit<TypeUser, "confirmPassword"> {
  isActive       : boolean;
  activationCode : string;
  createdAt      : Date;
  role           : string;
  profilePicture : string;
}

const Schema = mongoose.Schema;

const UserSchema = new Schema<User>({
  fullName       : { type: Schema.Types.String, required: true },
  username       : { type: Schema.Types.String, required: true, unique: true },
  email          : { type: Schema.Types.String, required: true, unique: true },
  password       : { type: Schema.Types.String, required: true },
  role           : { type: Schema.Types.String, enum: [ROLES.ADMIN, ROLES.MEMBER], default: ROLES.MEMBER },
  profilePicture : { type: Schema.Types.String, default: "user.jpg" },
  isActive       : { type: Schema.Types.Boolean, default: false },
  activationCode : { type: Schema.Types.String, },
}, {
  timestamps: true,
});

UserSchema.pre("save", function(next) {
  const user = this;
  user.password = encrypt(user.password);
  user.activationCode = encrypt(user.id);
  next();
});

UserSchema.post("save", async function(doc, next) {
  try {
    const user = doc;

    console.log("Send Email To :", user.email);
    const contentMail = await renderMailHtml("registration-success.ejs",{
      username : user.username,
      fullname : user.fullName,
      email    : user.email,
      createdAt: user.createdAt,
    activationLink : `${CLIENT_HOST}/auth/activation?code=${user.activationCode}`
  });

  await sendMail({
    from    : EMAIL_SMTP_USER,
    to      : user.email,
    subject : "Activasi Akun Anda",
    html    : contentMail,
  });
} catch (error) {
    console.log("error >", error);
  } finally {
    next();
  }
});

UserSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
}

const UserModel = mongoose.model(USER_MODEL_NAME, UserSchema);

export default UserModel;


