import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMessageDocument extends Document {
  thread: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content: string;
  attachments: string[];
  readAt?: Date;
  createdAt: Date;
}

export interface IMessageThreadDocument extends Document {
  enquiry?: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  lastMessage?: string;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessageDocument>(
  {
    thread: { type: Schema.Types.ObjectId, ref: "MessageThread", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, trim: true },
    attachments: [{ type: String }],
    readAt: { type: Date },
  },
  { timestamps: true }
);

MessageSchema.index({ thread: 1, createdAt: 1 });

const MessageThreadSchema = new Schema<IMessageThreadDocument>(
  {
    enquiry: { type: Schema.Types.ObjectId, ref: "Enquiry" },
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    lastMessage: { type: String },
    lastMessageAt: { type: Date },
  },
  { timestamps: true }
);

MessageThreadSchema.index({ participants: 1, lastMessageAt: -1 });
MessageThreadSchema.index({ enquiry: 1 });

export const Message: Model<IMessageDocument> =
  mongoose.models.Message ||
  mongoose.model<IMessageDocument>("Message", MessageSchema);

export const MessageThread: Model<IMessageThreadDocument> =
  mongoose.models.MessageThread ||
  mongoose.model<IMessageThreadDocument>("MessageThread", MessageThreadSchema);
