import mongoose from 'mongoose';

const guestSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  idProof: {
    type: {
      type: String, // e.g. 'passport', 'driver-license'
      required: true
    },
    number: {
      type: String,
      required: true
    }
  },
  preferences: {
    roomType: String,
    amenities: [String],
    specialRequests: String
  },
  stayHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reservation'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Guest = mongoose.model('Guest', guestSchema);

export default Guest;
