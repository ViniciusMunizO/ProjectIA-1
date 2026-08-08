import { Button } from '../../components/ui/Button';
import { FileDropInput } from '../../components/ui/FileDropInput';
import type { Cliente } from '../../../../shared/src/types/cliente.types';
import { ClienteFormFields } from './ClienteFormFields';
import { useClienteForm } from './useClienteForm';

type ClienteFormProps = {
  readonly onSuccess: (cliente: Cliente, documentoUploadFailed: boolean) => void;
};

export const ClienteForm = ({ onSuccess }: ClienteFormProps) => {
  const {
    fields,
    setField,
    handleTipoDocumentoChange,
    handleDocumentoChange,
    handleTelefoneChange,
    arquivo,
    handleFileChange,
    arquivoError,
    fieldErrors,
    formError,
    isSubmitting,
    isLookingUpCnpj,
    handleCnpjLookup,
    handleSubmit,
  } = useClienteForm({ onSuccess });

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

      <FileDropInput
        file={arquivo}
        error={arquivoError}
        onFileChange={handleFileChange}
        label="Documento (opcional — PDF, JPG ou PNG)"
        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
      />

      {formError ? (
        <p role="alert" className="text-xs text-[var(--danger)]">
          {formError}
        </p>
      ) : null}

      <Button type="submit" variant="solid" isLoading={isSubmitting} className="mt-1 w-fit">
        Cadastrar cliente
      </Button>
    </form>
  );
};
