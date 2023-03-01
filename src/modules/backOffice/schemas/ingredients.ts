import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';

@modelOptions({ options: { customName: 'ingredient' } })
export class IngredientSchema {
  @prop({ type: () => String, required: true, unique: true })
  id: string;

  @prop({ type: () => String, required: true })
  name: string;

  @prop({ type: () => String })
  type: string;
}

export const IngredientModel = getModelForClass(IngredientSchema);
