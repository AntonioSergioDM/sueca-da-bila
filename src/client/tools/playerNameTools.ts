// eslint-disable-next-line import/no-extraneous-dependencies
import {
  uniqueNamesGenerator,
  adjectives, colors, names,
} from 'unique-names-generator';

const LOCALSTORAGE_NAME = 'sueca-username';

export const playerNameTools = {
  get: () => {
    if (typeof localStorage === 'undefined') {
      return '';
    }

    let name = (
      (typeof localStorage !== 'undefined' ? localStorage.getItem(LOCALSTORAGE_NAME) : '')
      || ''
    ).trim();

    if (!name) {
      name = uniqueNamesGenerator({
        dictionaries: [adjectives, colors, names],
        length: 2,
        separator: ' ',
        style: 'capital',
      });
    }

    return name;
  },

  set: (name: string) => {
    localStorage.setItem(LOCALSTORAGE_NAME, name);
  },

  reset: () => {
    localStorage.removeItem(LOCALSTORAGE_NAME);
  },
};
