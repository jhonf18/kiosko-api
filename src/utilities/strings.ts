/* eslint-disable prefer-const */
export const normalizeString = (str: string): string => {
  let from = 'ÃÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛãàáäâèéëêìíïîòóöôùúüûÑñÇç',
    to = 'AAAAAEEEEIIIIOOOOUUUUaaaaaeeeeiiiioooouuuunncc',
    mapping: any = {};

  for (let i = 0, j = from.length; i < j; i++) mapping[from.charAt(i)] = to.charAt(i);

  let ret = [];
  for (let i = 0, j = str.length; i < j; i++) {
    let c = str.charAt(i);

    if (mapping.hasOwnProperty(str.charAt(i))) ret.push(mapping[c]);
    else ret.push(c);
  }
  return ret.join('');
};

export const ToLowerCaseFirstLetter = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
