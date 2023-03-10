/**
 * It returns the key of an object that matches the value passed in
 * @param {Object} object - The object to search through.
 * @param {any} value - any
 * @returns The key of the object that has the value passed in.
 */
export const getKeyByValue = function (object: Object, value: any) {
  return Object.keys(object).find((key: string) => object[key as keyof object] === value);
};

/**
 * "Get an object from an array of objects by a field and value."
 *
 * The function takes three parameters:
 *
 * arr: An array of objects.
 * field: The field to search by.
 * value: The value to search for.
 * The function returns either the object that matches the field and value or false if no match is
 * found
 * @param arr - The array to search through
 * @param {string} field - The field in the object that you want to check for the value.
 * @param {any} value - The value you're looking for
 * @returns A function that takes in an array, a field, and a value. It will return an object from the
 * array that matches the field and value.
 */
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

/**
 * It returns an array of elements that are in array1 but not in array2
 * @param array1 - Array<any>
 * @param array2 - Array<any>
 * @returns The elements that are in array1 but not in array2
 */
export const getElementsDifferentsOfTwoArrays = (array1: Array<any>, array2: Array<any>): Array<any> => {
  return array1.filter(x => !array2.includes(x));
};

/**
 * It checks if a string is a valid UUID
 * @param {string} str - The string to check if it's a valid UUID
 * @returns A boolean value.
 */
export const checkIfValidUUID = (str: string): boolean => {
  // Regular expression to check if string is a valid UUID
  const regexExp = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;

  return regexExp.test(str);
};

/**
 * It checks if all the elements in an array are strings
 * @param arr - Array<any>
 * @returns A function that takes an array as an argument and returns a boolean.
 */
export const checkIsStringsArray = (arr: Array<any>) => {
  for (let i = 0; i < arr.length; i++) {
    if (typeof arr[i] != 'string') {
      return false;
    }
  }

  return true;
};
