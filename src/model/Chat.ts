// model/Chat.ts
import mongoose, { Schema, Document } from 'mongoose'

interface IMessage extends Document {
  text: string
  isUser: boolean
  timestamp: Date
}

interface IChat extends Document {
  userId: mongoose.Types.ObjectId
  title: string
  messages: IMessage[]
  createdAt: Date
  updatedAt: Date
}

const MessageSchema = new Schema<IMessage>({
  text: { type: String, required: true },
  isUser: { type: Boolean, required: true },
  timestamp: { type: Date, default: Date.now }
})

const ChatSchema = new Schema<IChat>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  messages: [MessageSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

ChatSchema.pre('save', function (next) {
  this.updatedAt = new Date()
  next()
})

export default mongoose.models.Chat || mongoose.model<IChat>('Chat', ChatSchema)
