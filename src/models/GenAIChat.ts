import { Document, Model, model, models, Schema } from "mongoose";

export interface IGenAIChat extends Document {
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

const genAIChatSchema = new Schema<IGenAIChat>(
  {
    userId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
genAIChatSchema.index({ userId: 1 });
genAIChatSchema.index({ createdAt: -1 });

export const GenAIChat: Model<IGenAIChat> =
  models.GenAIChat || model<IGenAIChat>("GenAIChat", genAIChatSchema); 