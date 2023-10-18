import { getModelForClass, modelOptions, prop, Ref } from '@typegoose/typegoose';
import { BranchOfficeSchema } from '../../backOffice/schemas/branchOffice';
import { ProductSchema } from '../../backOffice/schemas/product';
import { OrderSchema } from './order';

@modelOptions({ options: { customName: 'ticket' } })
export class TicketSchema {
  @prop({ type: () => String, required: true, unique: true })
  id: string;

  @prop({ ref: () => ProductSchema, required: true })
  product: Ref<ProductSchema, string>;

  @prop({ type: () => Number, required: true })
  price: number;

  @prop({ type: () => Array<String>, required: true })
  ingredients: Array<string>;

  @prop({ type: () => Array<String>, required: true })
  sections: Array<String>;

  @prop({ type: () => String })
  comments: String;

  @prop({ ref: () => OrderSchema, required: true })
  order: Ref<OrderSchema>;

  @prop({ ref: () => BranchOfficeSchema, required: true })
  branch_office: Ref<BranchOfficeSchema>;

  @prop({ type: () => Date })
  date_accepted?: Date;

  @prop({ type: () => Date })
  date_finished?: Date;

  @prop({ type: () => Boolean, default: false })
  finished: Boolean;

  @prop({ default: Date.now, type: () => Date })
  created_at: Date;

  @prop({ default: Date.now, type: () => Date })
  updated_at: Date;

  @prop({ default: Date.now, type: () => Date, expires: '2d' })
  expires_at: Date;
}

export const TicketModel = getModelForClass(TicketSchema);
