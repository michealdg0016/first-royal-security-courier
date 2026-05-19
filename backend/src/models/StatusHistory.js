import { Schema, model } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

const statusHistorySchema = new Schema({
  _id: { type: String, default: uuidv4 },
  shipment_id: { type: String, ref: 'Shipment', required: true },
  status: { type: String, required: true },
  note: { type: String, default: null },
  location: { type: String, default: '' },
  updated_by: { type: String, default: null },
  created_at: { type: Date, default: Date.now },
}, { _id: false, versionKey: false })

statusHistorySchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => { delete ret._id; return ret }
})
statusHistorySchema.virtual('id').get(function () { return this._id })

export default model('StatusHistory', statusHistorySchema)
