/**
 *
 * @param data {Object} The object for delete fields
 * @param fields {Array} Array of fields such that you want delete
 * @returns Data with fields deleted
 */
export const deleteFields = (data: Object, fields?: Array<string>) => {
  const dataObject = JSON.parse(JSON.stringify(data));

  if (fields) {
    for (let i = 0; i < fields.length; i++) {
      delete dataObject[fields[i]];
    }
  }

  delete dataObject._id;
  delete dataObject.__v;
  delete dataObject.updated_at;

  return dataObject;
};
