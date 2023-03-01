import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';

@modelOptions({ options: { customName: 'category_of_product' } })
export class ProductCategorySchema {
  @prop({ type: () => String, required: true, unique: true })
  id: string;

  @prop({ type: () => String, required: true })
  name: string;

  @prop({ type: () => Array<String>, required: false, default: [] })
  subcategories: string[];
}

export const ProductCategoryModel = getModelForClass(ProductCategorySchema);
