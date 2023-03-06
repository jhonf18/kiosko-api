import { getModelForClass, modelOptions, prop, Ref, Severity } from '@typegoose/typegoose';
import mongoose from 'mongoose';
import { ProductSchema } from '../../backOffice/schemas/product';
import { OrderSchema } from './order';

@modelOptions({ options: { customName: 'ticket' } })
export class TicketSchema {
  @prop({ type: () => String, required: true, unique: true })
  id: string;

  @prop({ ref: () => ProductSchema, required: false })
  product: Ref<ProductSchema, string>;

  @prop({ type: () => String, required: false })
  product_variant_id?: string;

  // { name, price, ingredients?, variants? }
  @prop({ allowMixed: Severity.ALLOW, type: () => mongoose.Schema.Types.Mixed, required: false })
  custom_product: Object;

  @prop({ type: () => Array<String>, required: true })
  sections: Array<String>;

  @prop({ type: () => String })
  comments?: String;

  @prop({ ref: () => OrderSchema, required: true })
  order: Ref<OrderSchema>;

  @prop({ type: () => Date })
  date_accepted?: Date;

  @prop({ type: () => Date })
  date_finished?: Date;

  @prop({ type: () => Boolean, default: false })
  finished: Boolean;

  @prop({ default: Date.now(), type: () => Date })
  created_at: Date;

  @prop({ default: Date.now(), type: () => Date })
  updated_at: Date;

  @prop({ default: Date.now(), type: () => Date, expires: '2d' })
  expires_at: Date;
}

export const TicketModel = getModelForClass(TicketSchema);
