import { Schema, model } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

const chatMessageSchema = new Schema({
  _id:         { type: String, default: uuidv4 },
  session_id:  { type: String, required: true, index: true },
  sender:      { type: String, enum: ['user', 'admin'], required: true },
  message:     { type: String, required: true, trim: true },
  sender_name: { type: String, default: 'Guest' },
  created_at:  { type: Date, default: Date.now },
}, { _id: false, versionKey: false })

chatMessageSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => { delete ret._id; return ret },
})
chatMessageSchema.virtual('id').get(function () { return this._id })

export default model('ChatMessage', chatMessageSchema)
