import { Response } from "express";
import { IPaginationQuery, IReqUser } from "../utils/interface";
import response from "../utils/response";
import TicketModel, { ticketDTO, TypeTicket } from "../models/ticket.model";
import { FilterQuery, isValidObjectId } from "mongoose";

export default {
  async create(req: IReqUser, res: Response) {
    try {
      await ticketDTO.validate(req.body);
      const result = await TicketModel.create(req.body);
      response.success(res, result, "Ticket created successfully");
    } catch (error) {
      response.error(res, error, "Failed to create ticket");
    }
  },

  async findAll(req: IReqUser, res: Response) {
    try {
      const {
        page = 10,
        limit = 10,
        search,
      } = req.query as unknown as IPaginationQuery;
      
      const query : FilterQuery<TypeTicket> = {};

      if (search) {
        Object.assign(query, {
          ...query,
          $text: { $search: search },
        });
      }

      const result = await TicketModel.find(query)
      .populate("event")
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
      .exec();

      const count = await TicketModel.countDocuments(query);

      response.pagination(res, result, {
        total: count,
        current :page,
        totalPage : Math.ceil(count / limit),
      }, "Found all tickets");

    } catch (error) {
      response.error(res, error, "Failed to find all tickets");
    }
  },

  async findOne(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        return response.notFound(res, "failed find one a ticket");
      }

      const result = await TicketModel.findById(id);
      if (!result) {
        return response.notFound(res, "failed find one a ticket");
      }
      response.success(res, result, "success find one a ticket");
    } catch (error) {
      response.error(res, error, "failed find one a ticket");
    }
  },

  async update(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;
      await ticketDTO.validate(req.body);

      if (!isValidObjectId(id)) {
        return response.notFound(res, "failed update a ticket");
      }

      const result = await TicketModel.findByIdAndUpdate(id, req.body, { new: true });
      response.success(res, result, "Success Update a Ticket");
    } catch (error) {
      response.error(res, error, "Failed to Update a Ticket");
    }
  },

  async remove(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        return response.notFound(res, "Failed Delete a Ticket");
      }

      const result = await TicketModel.findByIdAndDelete(id, { new: true });
      response.success(res, result, "Success Delete a Ticket");
    } catch (error) {
      response.error(res, error, "Failed to Delete a Ticket");
    }
  },

  async findAllByEvent(req: IReqUser, res: Response) {
    try {
      const { eventId } = req.params;
      
      if (!isValidObjectId(eventId)) {
        return response.error(res, null, "Ticket not found");
      }

      const result = await TicketModel.find({ event: eventId }).exec();
      response.success(res, result, "Success Find All Tickets By Event");
    } catch (error) {
      response.error(res, error, "Failed to Find All Tickets By Event");
    }
  },
}