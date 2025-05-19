import mongoose, { Schema, model, models, Document, Types } from 'mongoose';

export interface IStudyClub extends Document {
  partyName: string;
  partyCode: string;
  admin: Types.ObjectId;
  members: Types.ObjectId[];
  pendingRequests: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

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
  },
  {
    timestamps: true,
  }
);

export const StudyClubModel = (mongoose.models.StudyClub as mongoose.Model<IStudyClub>) || mongoose.model<IStudyClub>('StudyClub', StudyClubSchema);
