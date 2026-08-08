import type { Fornecedor } from '../../../../shared/src/types/fornecedor.types';
import { Button } from '../../components/ui/Button';
import { FornecedorFormFields } from './FornecedorFormFields';
import { useFornecedorEditForm } from './useFornecedorEditForm';

type FornecedorEditFormProps = {
  readonly fornecedor: Fornecedor;
  readonly onSuccess: (fornecedor: Fornecedor) => void;
  readonly onCancel: () => void;
};

export const FornecedorEditForm = ({ fornecedor, onSuccess, onCancel }: FornecedorEditFormProps) => {
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
  } = useFornecedorEditForm({ fornecedor, onSuccess });

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

      <div className="flex gap-2">
        <Button type="submit" variant="solid" isLoading={isSubmitting}>
          Salvar alterações
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
};
