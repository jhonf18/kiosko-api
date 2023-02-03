import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import { Document } from 'mongoose';

export type UserDocument = UserSchema & Document;

@modelOptions({ options: { customName: 'user' } })
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

  // Timestamps
  @prop({ default: Date.now(), type: () => Date })
  created_at: Date;

  @prop({ default: Date.now(), type: () => Date })
  updated_at: Date;
}

export const UserModel = getModelForClass(UserSchema);
