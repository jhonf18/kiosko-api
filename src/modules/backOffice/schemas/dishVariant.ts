import { getModelForClass, modelOptions, prop, Ref } from '@typegoose/typegoose';
import { IngredientSchema } from './ingredients';

@modelOptions({ options: { customName: 'dish_variant' } })
export class DishVariantSchema {
  @prop({ type: () => String, required: true, unique: true })
  id: string;

  @prop({ type: () => String, required: true })
  name: string;

  @prop({ ref: () => Array<IngredientSchema>, type: () => Array<IngredientSchema>, required: false, default: [] })
  ingredients?: Array<Ref<IngredientSchema, string>>;
}

export const DishVariantModel = getModelForClass(DishVariantSchema);
