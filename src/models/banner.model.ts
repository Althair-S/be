import mongoose, { Schema } from "mongoose";
import * as yup from "yup";

export const BANNER_MODEL_NAME = "Banner";

export const bannerDTO = yup.object({
  title       : yup.string().required(),
  image       : yup.string().required(),
  isShow      : yup.boolean().required(),
});

export type TypeBanner = yup.InferType<typeof bannerDTO>;

interface Banner extends TypeBanner {}

const BannerSchema = new Schema<Banner>({
  title       : { type: Schema.Types.String, required: true },
  image       : { type: Schema.Types.String, required: true },
  isShow      : { type: Schema.Types.Boolean, required: true },
}, { timestamps: true }).index({ title: "text" });

const BannerModel = mongoose.model(BANNER_MODEL_NAME, BannerSchema);

export default BannerModel;