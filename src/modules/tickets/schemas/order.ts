import { getModelForClass, modelOptions, prop, Ref } from '@typegoose/typegoose';
import { ProductSchema } from '../../backOffice/schemas/product';
import { UserSchema } from './../../../shared/schemas/user';
import { BranchOfficeSchema } from './../../backOffice/schemas/branchOffice';
import { TicketSchema } from './ticket';

@modelOptions({ options: { customName: 'order' } })
export class OrderSchema {
  @prop({ type: () => String, required: true, unique: true })
  id: string;

  @prop({
    ref: () =>
      Array<{
        product: ProductSchema;
        ticket_id?: TicketSchema;
        ids_selected_ingredients?: Array<String>;
        comments: string;
        price?: number;
      }>,
    type: () => Array<String>,
    required: false,
    default: []
  })
  selected_products: Array<{
    product: Ref<ProductSchema, string>;
    ticket_id?: Ref<TicketSchema, string>;
    ids_selected_ingredients?: Array<string>;
    comments: string;
    price?: number;
  }>;

  @prop({ type: () => String, required: true })
  name: string;

  @prop({ type: () => String })
  comments?: string;

  @prop({ type: () => Number })
  total_price: number;

  @prop({ type: () => Boolean, default: true })
  is_open: boolean;

  @prop({ ref: () => UserSchema, required: true })
  waiter: Ref<UserSchema>;

  @prop({ ref: () => BranchOfficeSchema, required: true })
  branch_office: Ref<BranchOfficeSchema>;

  @prop({ default: Date.now, type: () => Date })
  created_at: Date;

  @prop({ default: Date.now, type: () => Date })
  updated_at: Date;
}

export const OrderModel = getModelForClass(OrderSchema);
