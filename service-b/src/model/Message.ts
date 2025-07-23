import mongoose, { Document, Schema } from "mongoose";

export interface IMessage extends Document {
  email: string;
  message: string;
  createdAt: Date;
}

const MessageSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IMessage>("Message", MessageSchema);
