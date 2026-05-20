import { Schema, model } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

const chatSessionSchema = new Schema({
  _id: { type: String, default: uuidv4 },
  user_id:      { type: String, default: null },
  user_name:    { type: String, default: 'Guest' },
  user_email:   { type: String, default: null },
  status:       { type: String, enum: ['open', 'closed'], default: 'open' },
  unread_admin: { type: Number, default: 0 },
  last_message: { type: String, default: '' },
  last_activity:{ type: Date, default: Date.now },
  tracking_code:{ type: String, default: null },
  created_at:   { type: Date, default: Date.now },
}, { _id: false, versionKey: false })

chatSessionSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => { delete ret._id; return ret },
})
chatSessionSchema.virtual('id').get(function () { return this._id })

export default model('ChatSession', chatSessionSchema)
