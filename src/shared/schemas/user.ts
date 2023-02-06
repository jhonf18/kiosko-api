import { getModelForClass, modelOptions, prop, Ref } from '@typegoose/typegoose';
import { Document } from 'mongoose';
import { BranchOfficeSchema } from '../../modules/backOffice/schemas/branchOffice';

export type UserDocument = UserSchema & Document;

@modelOptions({
  schemaOptions: { collection: 'users' },
  options: { customName: 'user' }
})
export class UserSchema {
  @prop({ type: () => String, unique: true, required: true })
  public id!: string;

  @prop({ type: () => String, required: true })
  name!: string;

  @prop({ type: () => String, required: true, unique: true })
  email!: string;

  @prop({ type: () => String, required: true, unique: true })
  nickname!: string;

  @prop({ type: () => String, required: true })
  password!: string;

  @prop({ type: () => String, required: true })
  role: string;

  @prop({ type: () => String, required: false })
  avatar?: string;

  @prop({ ref: () => BranchOfficeSchema, required: true })
  branch_office: Ref<BranchOfficeSchema>;

  @prop({ type: () => Boolean, required: false, default: false })
  active?: boolean;

  // Timestamps
  @prop({ default: Date.now(), type: () => Date })
  created_at: Date;

  @prop({ default: Date.now(), type: () => Date })
  updated_at: Date;
}

export const UserModel = getModelForClass(UserSchema);
