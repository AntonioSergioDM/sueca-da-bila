import type { ReactNode } from 'react';

import {
  FormProvider,
  type FieldValues,
  type SubmitHandler,
  type UseFormReturn,
  type SubmitErrorHandler,
} from 'react-hook-form';

type FormWrapperProps<TValues extends FieldValues = FieldValues> = UseFormReturn<TValues, any, undefined> & {
  children: ReactNode;
  onSuccess: SubmitHandler<TValues>;
  onError?: SubmitErrorHandler<TValues>;
};

const FormWrapper = <TValues extends FieldValues = FieldValues>(
  props: FormWrapperProps<TValues>,
) => {
  const {
    onSuccess,
    onError,
    children,
    ...form
  } = props;

  return (
    <FormProvider {...form}>
      <form noValidate onSubmit={form.handleSubmit(onSuccess, onError)}>
        {children}
      </form>
    </FormProvider>
  );
};

export default FormWrapper;
