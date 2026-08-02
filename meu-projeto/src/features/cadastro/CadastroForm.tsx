import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import type { CadastroRecord } from '../../../../shared/src/types/cadastro.types';
import { FileDropInput } from './FileDropInput';
import { useCadastroForm } from './useCadastroForm';

type CadastroFormProps = {
  readonly onSuccess: (record: CadastroRecord) => void;
};

export const CadastroForm = ({ onSuccess }: CadastroFormProps) => {
  const {
    nome,
    setNome,
    cpf,
    handleCpfChange,
    email,
    setEmail,
    telefone,
    handleTelefoneChange,
    file,
    handleFileChange,
    fieldErrors,
    formError,
    isSubmitting,
    handleSubmit,
  } = useCadastroForm({ onSuccess });

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <TextField
        label="Nome"
        type="text"
        autoComplete="name"
        value={nome}
        onChange={(event) => setNome(event.target.value)}
        error={fieldErrors.nome}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="CPF"
          type="text"
          inputMode="numeric"
          placeholder="000.000.000-00"
          value={cpf}
          onChange={(event) => handleCpfChange(event.target.value)}
          error={fieldErrors.cpf}
        />
        <TextField
          label="Telefone"
          type="tel"
          inputMode="numeric"
          placeholder="(00) 00000-0000"
          value={telefone}
          onChange={(event) => handleTelefoneChange(event.target.value)}
          error={fieldErrors.telefone}
        />
      </div>
      <TextField
        label="E-mail"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={fieldErrors.email}
      />

      <FileDropInput file={file} error={fieldErrors.arquivo} onFileChange={handleFileChange} />

      {formError ? (
        <p role="alert" className="text-xs text-red-500">
          {formError}
        </p>
      ) : null}

      <Button type="submit" variant="solid" isLoading={isSubmitting} className="mt-1 w-fit">
        Salvar cadastro
      </Button>
    </form>
  );
};
