export const getKeyByValue = function (object: Object, value: any) {
  return Object.keys(object).find((key: string) => object[key as keyof object] === value);
};

export const getObjectFromArray = (
  arr: Array<{ [key: string]: any }>,
  field: string,
  value: any
): boolean | { [key: string]: any } => {
  for (let i = 0; i < arr.length; i++) {
    let obj: { [key: string]: any } = arr[i];
    if (obj[field] === value) {
      return obj;
    }
  }

  return false;
};

export const getIndexOfElmentInArray = (array: Array<any>, el: any): boolean | number => {
  for (let i = 0; i < array.length; i++) {
    if (el === array[i]) {
      return i;
    }
  }
  return false;
};

export const getElementsDifferentsOfTwoArrays = (array1: Array<any>, array2: Array<any>): Array<any> => {
  return array1.filter(x => !array2.includes(x));
};
