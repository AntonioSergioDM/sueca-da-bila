/* eslint-disable no-nested-ternary */
type Options = {
  /** Default true */
  upperCase?: boolean;
  /** Only the first and last initials. Default true */
  firstLast?: boolean;
};

const getInitials = (str: string, options?: Options) => {
  const firstLast = options?.firstLast ?? true;
  const upperCase = options?.upperCase ?? true;

  const items = str
    .trim()
    .split(/\s+/);

  return items
    .map((item, idx) => (
      item
        && (
          !firstLast
          || (firstLast && (idx === 0 || idx === (items.length - 1)))
        )
        ? upperCase
          ? item[0].toUpperCase()
          : item[0]
        : ''
    ))
    .join('');
};

export default getInitials;
