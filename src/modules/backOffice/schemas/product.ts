import { getModelForClass, modelOptions, prop, Ref } from '@typegoose/typegoose';
import { BranchOfficeSchema } from './branchOffice';
import { DishVariantSchema } from './dishVariant';

@modelOptions({ options: { customName: 'product' } })
export class ProductSchema {
  @prop({ type: () => String, required: true, unique: true })
  id: string;

  @prop({ type: () => String, required: true })
  name: string;

  @prop({ type: () => Array<String>, default: [] })
  media_files?: Array<string>;

  @prop({ ref: () => Number, type: () => Number, required: true, default: 0 })
  price: number;

  @prop({ type: () => Boolean, required: true, default: true })
  active: boolean;

  @prop({ type: () => String, required: true })
  category: string;

  @prop({ type: () => String, required: true })
  subcategory: string;

  @prop({ type: () => Array<String> })
  passage_sections: Array<string>;

  @prop({ ref: () => BranchOfficeSchema, required: true })
  branch_office: Ref<BranchOfficeSchema, string>;

  @prop({ ref: () => Array<DishVariantSchema>, type: () => Array<String>, required: false, default: [] })
  variants?: Array<Ref<DishVariantSchema, string>>;

  @prop({ default: Date.now(), type: () => Date })
  created_at: Date;

  @prop({ default: Date.now(), type: () => Date })
  updated_at: Date;
}

export const ProductModel = getModelForClass(ProductSchema);
