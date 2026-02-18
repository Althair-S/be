import { Response } from "express"
import { IReqUser } from "../utils/interface"
import uploader from "../utils/uploader"
import response from "../utils/response"


export default {
  async single(req : IReqUser, res : Response) {
    if(!req.file) {
        return response.error(res,null, "File is not exist");
      }

    try {
      const result = await uploader.uploadSingle(req.file as Express.Multer.File)
      response.success(res, result, "File uploaded successfully");
    } catch {
      response.error(res,null, "failed upload a file");
    }
  },

  async multiple (req : IReqUser, res : Response) {
    if(!req.files || req.files.length === 0) {
        return response.error(res,null, "File is not exist");
      }

    try {
      const result = await uploader.uploadMultiple(req.files as Express.Multer.File[])
      response.success(res, result, "Files uploaded successfully");
    } catch {
      response.error(res,null, "failed upload a files");
    }
  },
  async remove (req : IReqUser, res : Response) {
    try {
      const { fileUrl } = req.body as { fileUrl : string}
      const result = await uploader.remove(fileUrl)
      response.success(res, result, "success remove file");
    } catch {
      response.error(res,null, "failed remove a file");
    }
  },
} 