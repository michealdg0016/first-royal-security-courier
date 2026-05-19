import { Schema, model } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

const shipmentSchema = new Schema({
  _id: { type: String, default: uuidv4 },
  tracking_code: { type: String, required: true, unique: true, uppercase: true },
  sender_id: { type: String, ref: 'User', default: null },
  sender_name: { type: String, required: true },
  sender_email: { type: String, required: true, lowercase: true },
  recipient_name: { type: String, required: true },
  recipient_email: { type: String, required: true, lowercase: true },
  recipient_phone: { type: String, default: null },
  origin_country: { type: String, required: true },
  destination_country: { type: String, required: true },
  package_description: { type: String, required: true },
  weight: { type: Number, required: true, default: 1.0 },
  status: { type: String, required: true, default: 'Order Placed' },
  status_index: { type: Number, required: true, default: 0 },
  is_frozen: { type: Boolean, default: false },
  service_type: { type: String, default: 'International Express' },
  notes: { type: String, default: null },
  estimated_delivery: { type: String, default: null },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
}, { _id: false, versionKey: false })

shipmentSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => { delete ret._id; return ret }
})
shipmentSchema.virtual('id').get(function () { return this._id })

export default model('Shipment', shipmentSchema)
