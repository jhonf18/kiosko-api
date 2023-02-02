import { getModelForClass, prop } from '@typegoose/typegoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

class User {
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
}

export const UserModel = getModelForClass(User);
