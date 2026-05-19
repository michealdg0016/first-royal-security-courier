import { Schema, model } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

const userSchema = new Schema({
  _id: { type: String, default: uuidv4 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password_hash: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  phone: { type: String, default: null },
  role: { type: String, enum: ['customer', 'admin', 'superadmin'], default: 'customer' },
  is_frozen: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
}, { _id: false, versionKey: false })

userSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => { delete ret._id; return ret }
})
userSchema.virtual('id').get(function () { return this._id })

export default model('User', userSchema)
