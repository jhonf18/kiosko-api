import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';

@modelOptions({ options: { customName: 'black_list' } })
class BlackListSchema {
  @prop({ type: () => String, required: true, unique: true })
  id: string;

  @prop({ default: Date.now(), type: () => Date })
  created_at: Date;

  @prop({ default: Date.now(), type: () => Date })
  updated_at: Date;

  @prop({ default: Date.now(), type: () => Date, expires: '18h' })
  expires_at: Date;
}

export const BlackListModel = getModelForClass(BlackListSchema);
