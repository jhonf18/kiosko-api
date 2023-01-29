import mongoose, { Schema, Types } from 'mongoose';

interface IUser {
  id: string;
  name: string;
  nickname: string;
  email: string;
  password: string;
  role?: Types.ObjectId;
  avatar?: string;
}

const UserSchema = new Schema<IUser>({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  nickname: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: Schema.Types.ObjectId,
    ref: 'Roles',
    required: false
  },
  avatar: {
    type: String,
    required: false
  }
});

export default mongoose.model('User', UserSchema);
