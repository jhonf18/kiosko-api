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

/**
 *
 * @param array Array of elements of differents types
 * @param el Element which will be searched within the array
 * @returns Index of element inside the array. If element no exists inside array this return false
 */
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

export const checkIfValidUUID = (str: string): boolean => {
  // Regular expression to check if string is a valid UUID
  const regexExp = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;

  return regexExp.test(str);
};

export const checkIsStringsArray = (arr: Array<any>) => {
  for (let i = 0; i < arr.length; i++) {
    if (typeof arr[i] != 'string') {
      return false;
    }
  }

  return true;
};
