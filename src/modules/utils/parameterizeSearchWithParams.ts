/**
 *
 * @param search {string} String of search, this search should come as "name id ..." for populate data should come as "name id employees.id ..."
 * @param fieldsNotSearch {string} Which parameters should not be delivered in the database lookup
 *
 * @example parameterizeSearchWithParams('name employees employees.id employees.nickname', 'password employees.password')
 * @returns {Object} This function returns all texts for select data in MongoDB and all objects for populate data.
 * @summary In this moment only working data, populate data not yet.
 */
export const parameterizeSearchWithParams = (search: string, fieldsNotSearch: string, addFields?: string) => {
  //TODO: Refactorizar el código de esta función
  // Convert search text in array
  const searchArray = search.split(' ');
  const fieldsNotSearchArray = fieldsNotSearch.split(' ');

  let selectArray = [];
  let objectsOfPopulateOneLevel: Array<any> = [];

  for (let i = 0; i < searchArray.length; i++) {
    let word = searchArray[i];
    const countPointsInWord = counterLetters(word, '.');

    switch (countPointsInWord) {
      case 0:
        /** We create the string to select the data of the document without populating
         *
         * 1. Verify that the requested fields are not in the unauthorized fields, if so, they are not pushing in array
         * */
        const isWordinArrayNotSearch = fieldsNotSearchArray.includes(word);
        if (!isWordinArrayNotSearch) {
          // Add accepted word in selection array
          selectArray.push(word);
        }
        break;
      case 1:
        const property = word.split('.')[0];
        const subProperty = word.split('.')[1];
        objectsOfPopulateOneLevel.push({
          path: property,
          select: subProperty
        });
        break;
      case 2:
        break;
    }
  }

  if (addFields) {
    const fieldsToAddArray = addFields?.split(' ');
    selectArray.push(...fieldsToAddArray);
  }

  const arrayPaths = Array.from(new Set(objectsOfPopulateOneLevel.map(x => x.path)));
  const result: Array<any> = arrayPaths
    .map(x => objectsOfPopulateOneLevel.filter(y => y.path === x))
    .map((x, i) => ({ path: arrayPaths[i], select: x.map(y => y.select).join(' ') }));

  return { select: selectArray.join(' '), populateOneLevel: result };
};

const counterLetters = (word: string, letter: string) => {
  let count = 0;
  let wordArray = word.split('');
  for (var i = 0, len = wordArray.length; i < len; i++) {
    if (wordArray[i] === letter) {
      count++;
    }
  }
  return count;
};
