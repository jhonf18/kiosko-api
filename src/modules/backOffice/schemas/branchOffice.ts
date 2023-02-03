import { getModelForClass, modelOptions, prop, Ref } from '@typegoose/typegoose';
import { UserSchema } from '../../../shared/schemas/user';

@modelOptions({ options: { customName: 'branch_office' } })
class BranchOfficeSchema {
  @prop({ type: () => String, required: true, unique: true })
  id: string;

  @prop({ type: () => String, required: true })
  name: string;

  @prop({ type: () => String, required: true })
  address: string;

  @prop({ ref: () => Array<UserSchema>, type: () => Array<String>, required: false, default: [] })
  employees?: Array<Ref<UserSchema, string>>;

  @prop({ ref: () => Array<UserSchema>, type: () => Array<String>, required: false, default: [] })
  leaders?: Array<Ref<UserSchema, string>>;

  @prop({ default: Date.now(), type: () => Date })
  created_at: Date;

  @prop({ default: Date.now(), type: () => Date })
  updated_at: Date;
}

export const BranchOfficeModel = getModelForClass(BranchOfficeSchema);
