import { v2 as cloudinary } from "cloudinary";

import {
  CLAUDINARY_CLOUD_NAME,
  CLAUDINARY_API_KEY,
  CLAUDINARY_API_SECRET
} from "./env"

cloudinary.config({
  cloud_name: CLAUDINARY_CLOUD_NAME,
  api_key: CLAUDINARY_API_KEY,
  api_secret: CLAUDINARY_API_SECRET
});

const toDataURL = (file: Express.Multer.File) => {
  const b64 = Buffer.from(file.buffer).toString("base64");
  const dataURL = `data:${file.mimetype};base64,${b64}`;
  return dataURL;
}

const getPublicIdFromFileURL = (fileUrl: string) => {
  const fileNameUsingSubstring = fileUrl.substring(
    fileUrl.lastIndexOf("/") + 1
  );
  const publicId = fileNameUsingSubstring.substring(
    0,
    fileNameUsingSubstring.lastIndexOf(".")
  );
  return publicId;
}

export default {
  async uploadSingle(file: Express.Multer.File) {
    const fileDataURL = toDataURL(file);
    const result = await cloudinary.uploader.upload(fileDataURL, {
      resource_type: "auto",
    });
    return result;
  },

  async uploadMultiple(files: Express.Multer.File[]) {
    const uploadBatch = files.map((item => {
      const result = this.uploadSingle(item);
      return result;
    }));
    const results = await Promise.all(uploadBatch);
    return results;
  },

  async remove(fileUrl: string) {
    const publidId = getPublicIdFromFileURL(fileUrl);
    const result = await cloudinary.uploader.destroy(publidId);
    return result;
  },
};