import mongoose, { Schema } from "mongoose";
import * as yup from "yup";   
import { EVENT_MODEL_NAME } from "./event.model";

export const TICKET_MODEL_NAME = "Ticket";

export const ticketDTO = yup.object({
  name        : yup.string().required(),
  price       : yup.number().required(),
  event       : yup.string().required(),
  quantity    : yup.number().required(),
  description : yup.string().required(),
});

export type TypeTicket = yup.InferType<typeof ticketDTO>;

interface Ticket extends Omit<TypeTicket, "event"> {
  event : Schema.Types.ObjectId;
}

const TicketSchema = new Schema<Ticket>({
  name        : { type: Schema.Types.String, required: true },
  price       : { type: Schema.Types.Number, required: true },
  event       : { type: Schema.Types.ObjectId, required: true, ref: EVENT_MODEL_NAME },
  quantity    : { type: Schema.Types.Number, required: true },
  description : { type: Schema.Types.String, required: true },
}, { timestamps: true }).index({ name: "text" });

const TicketModel = mongoose.model(TICKET_MODEL_NAME, TicketSchema);

export default TicketModel;