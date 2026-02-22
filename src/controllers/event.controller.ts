import { Response } from "express";
import { IPaginationQuery, IReqUser } from "../utils/interface";
import response from "../utils/response";
import EventModel, { eventDTO, TypeEvent } from "../models/event.model";
import { FilterQuery, isValidObjectId } from "mongoose";

export default {
  async create(req: IReqUser, res: Response) {
    try {
      const payload = {...req.body, createdBy: req.user?.id} as TypeEvent;
      await eventDTO.validate(payload);
      const result = await EventModel.create(payload);
      response.success(res, result, "success create event");
    } catch (error) {
      response.error(res, error, "failed to create event");
    }
  },

  async findAll(req: IReqUser, res: Response) {
    try {

      const buildQuery = (filter:any) => {
        let query : FilterQuery<TypeEvent> = {};

        if (filter.search) query.$text = { $search: filter.search };
        if (filter.category) query.category = filter.category;
        if (filter.isOnline) query.isOnline = filter.isOnline;
        if (filter.isFeatured) query.isFeatured = filter.isFeatured;
        if (filter.isPublish) query.isPublish = filter.isPublish;

        return query;
      };

      const { limit = 10, page = 1, search, category, isOnline, isFeatured, isPublish } =
        req.query;

      const query = buildQuery({
        search,
        category,
        isOnline,
        isFeatured,
        isPublish,
      });
      
      const result = await EventModel.find(query)
      .limit(+limit)
      .skip((+page - 1) * +limit)
      .sort({createdAt: -1})
      .lean()
      .exec();
      const count = await EventModel.countDocuments(query);

      response.pagination(res, result, {
        current: +page,
        total : count,
        totalPage: Math.ceil(count / +limit),
      }, "success fetch all events");

    } catch (error) {
      response.error(res, error, "failed to find all events");
    }
  },

  async findOne(req: IReqUser, res: Response) {
    try {
      const {id} = req.params;
      if (!isValidObjectId(id)) {
        return response.notFound(res, "failed find one event");
      }
      const result = await EventModel.findById(id);
      if (!result) {
        return response.notFound(res, "failed find one event");
      }
      response.success(res, result, "success find one event");
    } catch (error) {
      response.error(res, error, "failed find one event");
    }
  },

  async update(req: IReqUser, res: Response) {
    try {
      const {id} = req.params;

      if (!isValidObjectId(id)) {
        return response.notFound(res, "failed update one event");
      }

      const result = await EventModel.findByIdAndUpdate(id, req.body, {new: true});
      response.success(res, result, "success update one event");
    } catch (error) {
      response.error(res, error, "failed to update one event");
    }
  },

  async remove(req: IReqUser, res: Response) {
    try {
      const {id} = req.params;

      if (!isValidObjectId(id)) {
        return response.notFound(res, "failed remove one event");
      }

      const result = await EventModel.findByIdAndDelete(id, {new : true});
      response.success(res, result, "success remove one event");
    } catch (error) {
      response.error(res, error, "failed to remove one event");
    }
  },

  async findOneBySlug(req: IReqUser, res: Response) {
    try {
      const {slug} = req.params;
      const result = await EventModel.findOne({slug});
      response.success(res, result, "success find one event by slug");
    } catch (error) {
      response.error(res, error, "failed to find one event by slug");
    }
  },
}