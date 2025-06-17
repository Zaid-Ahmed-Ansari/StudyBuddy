import mongoose, { Schema, Document } from "mongoose";
import { string } from "zod";

interface IMessage {
  text: string; // encrypted base64 string
  isUser: boolean;
  timestamp: Date;
}
export interface Message extends Document{
    content : string;
    createdAt: Date;
    _id: string;
    contentType?: 'plain' | 'markdown';
}

  interface IChat  {
    _id: mongoose.Types.ObjectId; // manually assigned _id
    userId: mongoose.Types.ObjectId;
    title: string; // encrypted base64 string
    messages: IMessage[];
    createdAt: Date;
    updatedAt: Date;
  }

export interface IUser {
  username: string;
  email: string;
  password: string;
  verifyCode: string;
  verifyCodeExpires: Date;
  isVerified: boolean;
  partyCode: string;
  chats: IChat[];
  saved: Message[];
  avatar?: {
    seed: string;
    style: string;
  };
  hasSelectedAvatar: boolean;
}

// Message Schema — no encryption in schema itself
const IMessageSchema = new Schema<IMessage>(
  {
    text: { type: String, required: true }, // encrypted base64 string
    isUser: { type: Boolean, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  {
    toJSON: { getters: false },
    toObject: { getters: false },
  }
);

// Chat Schema — no encryption in schema itself
const ChatSchema = new Schema<IChat>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, default: "New Chat" }, // encrypted base64 string
    messages: [IMessageSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    toJSON: { getters: false },
    toObject: { getters: false },
  }
);

ChatSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

ChatSchema.index({ userId: 1, updatedAt: -1 });
ChatSchema.index({ userId: 1, _id: 1 });
const MessageSchema: Schema<Message> = new Schema({
    content:{
        type: String,
        required: true,
    },
    createdAt:{
        type: Date,
        default: Date.now,
        required: true,
    },
    _id:{
        type: String,
        required: true
    },
    contentType:{
        type: String,
        enum: ['plain', 'markdown'],
        default: 'plain'
    }
})
// User Schema
const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      match: /.+@.+\..+/,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    verifyCode: { type: String, required: true },
    verifyCodeExpires: { type: Date, required: true },
    isVerified: { type: Boolean, default: false },
    partyCode: { type: String, required: true },
    chats: [ChatSchema],
    saved: [MessageSchema],
    avatar: {
      seed:{
        type: String,
        required: false,
        default: "", // local default avatar seed
      },
      style: {
        type: String,
        required: false,
        default: "", // local default avatar style
      } // local default avatar
    },
    hasSelectedAvatar: {
  type: Boolean,
  default: false,
}
  },
  {
    timestamps: true,
    toJSON: { getters: false },
    toObject: { getters: false },
  },
  
);

export const UserModel =
  (mongoose.models.User as mongoose.Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);
