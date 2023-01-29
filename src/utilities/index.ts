export const getKeyByValue = function (object: Object, value: any) {
  return Object.keys(object).find((key: string) => object[key as keyof object] === value);
};
