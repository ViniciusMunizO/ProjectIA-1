import type { Cliente } from '../../../../shared/src/types/cliente.types';
import { Button } from '../../components/ui/Button';
import { ClienteFormFields } from './ClienteFormFields';
import { useClienteEditForm } from './useClienteEditForm';

type ClienteEditFormProps = {
  readonly cliente: Cliente;
  readonly onSuccess: (cliente: Cliente) => void;
  readonly onCancel: () => void;
};

export const ClienteEditForm = ({ cliente, onSuccess, onCancel }: ClienteEditFormProps) => {
  const {
    fields,
    setField,
    handleTipoDocumentoChange,
    handleDocumentoChange,
    handleTelefoneChange,
    fieldErrors,
    formError,
    isSubmitting,
    isLookingUpCnpj,
    handleCnpjLookup,
    handleSubmit,
  } = useClienteEditForm({ cliente, onSuccess });

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <ClienteFormFields
        fields={fields}
        setField={setField}
        fieldErrors={fieldErrors}
        onTipoDocumentoChange={handleTipoDocumentoChange}
        onDocumentoChange={handleDocumentoChange}
        onTelefoneChange={handleTelefoneChange}
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
