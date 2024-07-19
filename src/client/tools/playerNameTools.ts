// eslint-disable-next-line import/no-extraneous-dependencies
import {
  uniqueNamesGenerator,
  adjectives, colors, names,
} from 'unique-names-generator';

const LOCALSTORAGE_NAME = 'sueca-username';

const hasLocalStorage = typeof localStorage !== 'undefined';

export const playerNameTools = {
  get: () => {
    if (!hasLocalStorage) { return ''; }

    let name = (localStorage.getItem(LOCALSTORAGE_NAME) || '').trim();

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
    if (hasLocalStorage) {
      localStorage.setItem(LOCALSTORAGE_NAME, name);
    }
  },

  reset: () => {
    if (hasLocalStorage) {
      localStorage.removeItem(LOCALSTORAGE_NAME);
    }
  },
};
