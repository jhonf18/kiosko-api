import mongoose, { Schema } from 'mongoose';
interface IRole {
  id: string;
  name: string;
}

const RoleSchema = new Schema<IRole>({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  }
});

export default mongoose.model('Role', RoleSchema);
