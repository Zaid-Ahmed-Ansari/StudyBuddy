import { Document, Model, model, models, Schema } from "mongoose";

export interface IGenAIMessage extends Document {
  userId: string;
  chatId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const genAIMessageSchema = new Schema<IGenAIMessage>(
  {
    userId: {
      type: String,
      required: true,
    },
    chatId: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
genAIMessageSchema.index({ userId: 1, chatId: 1 });
genAIMessageSchema.index({ createdAt: -1 });

export const GenAIMessage: Model<IGenAIMessage> =
  models.GenAIMessage || model<IGenAIMessage>("GenAIMessage", genAIMessageSchema); 