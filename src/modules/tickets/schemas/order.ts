import { getModelForClass, modelOptions, prop, Ref, Severity } from '@typegoose/typegoose';
import mongoose from 'mongoose';
import { ProductSchema } from '../../backOffice/schemas/product';
import { UserSchema } from './../../../shared/schemas/user';
import { BranchOfficeSchema } from './../../backOffice/schemas/branchOffice';

@modelOptions({ options: { customName: 'order' } })
export class OrderSchema {
  @prop({ type: () => String, required: true, unique: true })
  id: string;

  @prop({
    ref: () =>
      Array<{
        product: ProductSchema;
        variant?: String;
      }>,
    type: () => Array<String>,
    required: false,
    default: []
  })
  products: Array<{ product: Ref<ProductSchema, string>; variant?: String }>;

  @prop({ type: () => String })
  comments?: string;

  @prop({ type: () => Number })
  total_price: number;

  @prop({ type: () => Boolean, default: true })
  is_open: boolean;

  @prop({ allowMixed: Severity.ALLOW, type: () => mongoose.Schema.Types.Mixed, required: false })
  custom_products?: any;

  @prop({ ref: () => UserSchema, required: true })
  waiter: Ref<UserSchema>;

  @prop({ ref: () => BranchOfficeSchema, required: true })
  branch_office: Ref<BranchOfficeSchema>;

  @prop({ default: Date.now(), type: () => Date })
  created_at: Date;

  @prop({ default: Date.now(), type: () => Date })
  updated_at: Date;
}

export const OrderModel = getModelForClass(OrderSchema);
