import {
  useMemo,
  useState,
  useCallback,
  type Dispatch,
  type SetStateAction,
  type ChangeEventHandler,
  useEffect,
} from 'react';

type UseInputReturn = [
  value: string,
  {
    value: string;
    onChange: ChangeEventHandler<HTMLInputElement>;
  },
  setValue: Dispatch<SetStateAction<string>>,
];

export const useInput = (defaultValue = '') => {
  const [inputValue, setInputValue] = useState(defaultValue);

  // reinitializing input everytime the default changes
  useEffect(() => {
    if (defaultValue) setInputValue(defaultValue);
  }, [defaultValue]);

  const handleOnChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    setInputValue(e.target.value);
  }, []);

  return useMemo<UseInputReturn>(() => [
    inputValue,
    {
      value: inputValue,
      onChange: handleOnChange,
    },
    setInputValue,
  ], [handleOnChange, inputValue]);
};
