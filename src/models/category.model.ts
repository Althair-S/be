import mongoose from "mongoose";
import * as yup from "yup";

const Schema = mongoose.Schema;

export const categoryDTO = yup.object({
  name: yup.string().required(),
  description: yup.string().required(),
  icon: yup.string().required(),
});

export type Category = yup.InferType<typeof categoryDTO>;

const CategorySchema = new Schema({
  name        : { type: String, required: true, },
  description : { type: String, required: true, },
  icon        : { type: String, required: true, },
},{
  timestamps: true
});

const CategoryModel = mongoose.model("Category", CategorySchema);

export default CategoryModel;