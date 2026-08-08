import type { Fornecedor } from '../../../../shared/src/types/fornecedor.types';
import { Button } from '../../components/ui/Button';
import { FornecedorFormFields } from './FornecedorFormFields';
import { useFornecedorForm } from './useFornecedorForm';

type FornecedorFormProps = {
  readonly onSuccess: (fornecedor: Fornecedor) => void;
};

export const FornecedorForm = ({ onSuccess }: FornecedorFormProps) => {
  const {
    fields,
    setField,
    handleCnpjChange,
    fieldErrors,
    formError,
    isSubmitting,
    isLookingUpCnpj,
    handleCnpjLookup,
    handleSubmit,
  } = useFornecedorForm({ onSuccess });

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <FornecedorFormFields
        fields={fields}
        setField={setField}
        fieldErrors={fieldErrors}
        onCnpjChange={handleCnpjChange}
        isLookingUpCnpj={isLookingUpCnpj}
        onCnpjLookup={() => void handleCnpjLookup()}
      />

      {formError ? (
        <p role="alert" className="text-xs text-[var(--danger)]">
          {formError}
        </p>
      ) : null}

      <Button type="submit" variant="solid" isLoading={isSubmitting} className="mt-1 w-fit">
        Cadastrar fornecedor
      </Button>
    </form>
  );
};
