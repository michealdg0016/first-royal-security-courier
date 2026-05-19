export { default as User } from './User.js'
export { default as Shipment } from './Shipment.js'
export { default as StatusHistory } from './StatusHistory.js'

export const STATUSES = [
  'Order Placed',
  'Package Picked Up',
  'Processing at Origin Hub',
  'Departed Origin Country',
  'In Transit (International)',
  'Arrived at Destination Country',
  'Customs Clearance',
  'At Delivery Hub',
  'Out for Delivery',
  'Delivered',
]

export function generateTrackingCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const seg = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `FRSC-${seg()}-${seg()}-${seg()}`
}
