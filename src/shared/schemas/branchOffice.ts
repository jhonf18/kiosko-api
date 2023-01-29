import mongoose, { Schema, Types } from 'mongoose';

interface IBranchOffice {
  id: string;
  name: string;
  address?: string;
  employees?: Array<Types.ObjectId>;
  leader?: Types.ObjectId;
}

const BranchOfficeSchema = new Schema<IBranchOffice>({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: false
  },
  employees: {
    type: [Schema.Types.ObjectId],
    ref: 'Users'
  },
  leader: {
    type: Schema.Types.ObjectId,
    ref: 'Users'
  }
});

export default mongoose.model('BranchOffices', BranchOfficeSchema);
