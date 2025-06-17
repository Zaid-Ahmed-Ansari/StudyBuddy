import mongoose, { Schema, model, models, Document, Types } from 'mongoose';

export interface IStudyClub {
  partyName: string;
  partyCode: string;
  admin: Types.ObjectId;
  members: Types.ObjectId[];
  pendingRequests: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  chats: IChatMessage[];
  expiresAt: Date;
}
export interface IChatMessage {
  sender: Types.ObjectId;
  content: string;
  createdAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const StudyClubSchema: Schema<IStudyClub> = new Schema(
  {
    partyName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    partyCode: {
      type: String,
      required: true,
      unique: true,
    },
    admin: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    pendingRequests: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    chats: [ChatMessageSchema],
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 40 * 60 * 1000), // 40 minutes from now
    },
  },
  {
    timestamps: true,
  }
);

// Add TTL index to automatically delete documents after 40 minutes
StudyClubSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const StudyClubModel = (mongoose.models.StudyClub as mongoose.Model<IStudyClub>) || mongoose.model<IStudyClub>('StudyClub', StudyClubSchema);
