import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import type { TipoDocumentoCliente } from '../../../../shared/src/types/cliente.types';
import type { ClienteFieldErrors, ClienteFormFieldsState } from './cliente-form-state';

type ClienteFormFieldsProps = {
  readonly fields: ClienteFormFieldsState;
  readonly setField: <K extends keyof ClienteFormFieldsState>(key: K, value: ClienteFormFieldsState[K]) => void;
  readonly fieldErrors: ClienteFieldErrors;
  readonly onTipoDocumentoChange: (tipo: TipoDocumentoCliente) => void;
  readonly onDocumentoChange: (value: string) => void;
  readonly onTelefoneChange: (value: string) => void;
  readonly isLookingUpCnpj: boolean;
  readonly onCnpjLookup: () => void;
};

export const ClienteFormFields = ({
  fields,
  setField,
  fieldErrors,
  onTipoDocumentoChange,
  onDocumentoChange,
  onTelefoneChange,
  isLookingUpCnpj,
  onCnpjLookup,
}: ClienteFormFieldsProps) => (
  <>
    <div className="flex gap-2" role="radiogroup" aria-label="Tipo de documento">
      {(['CPF', 'CNPJ'] as const).map((tipo) => (
        <button
          key={tipo}
          type="button"
          role="radio"
          aria-checked={fields.tipoDocumento === tipo}
          onClick={() => onTipoDocumentoChange(tipo)}
          className={`h-9 rounded-full border px-4 text-sm font-medium transition-colors duration-150 ${
            fields.tipoDocumento === tipo
              ? 'border-[var(--accent)] bg-[var(--accent-bg)] text-[var(--accent)]'
              : 'border-[var(--border)] text-[var(--text)]'
          }`}
        >
          {tipo}
        </button>
      ))}
    </div>

    <div className="flex items-end gap-2">
      <div className="flex-1">
        <TextField
          label={fields.tipoDocumento === 'CPF' ? 'CPF' : 'CNPJ'}
          type="text"
          inputMode="numeric"
          placeholder={fields.tipoDocumento === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00'}
          value={fields.documento}
          onChange={(event) => onDocumentoChange(event.target.value)}
          error={fieldErrors.documento}
        />
      </div>
      {fields.tipoDocumento === 'CNPJ' ? (
        <Button type="button" variant="ghost" isLoading={isLookingUpCnpj} onClick={onCnpjLookup}>
          Buscar
        </Button>
      ) : null}
    </div>

    <TextField
      label={fields.tipoDocumento === 'CNPJ' ? 'Razão social' : 'Nome'}
      type="text"
      value={fields.nome}
      onChange={(event) => setField('nome', event.target.value)}
      error={fieldErrors.nome}
    />

    {fields.tipoDocumento === 'CNPJ' ? (
      <TextField
        label="Nome fantasia"
        type="text"
        value={fields.nomeFantasia}
        onChange={(event) => setField('nomeFantasia', event.target.value)}
        error={fieldErrors.nomeFantasia}
      />
    ) : null}

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <TextField
        label="E-mail"
        type="email"
        value={fields.email}
        onChange={(event) => setField('email', event.target.value)}
        error={fieldErrors.email}
      />
      <TextField
        label="Telefone"
        type="tel"
        inputMode="numeric"
        placeholder="(00) 00000-0000"
        value={fields.telefone}
        onChange={(event) => onTelefoneChange(event.target.value)}
        error={fieldErrors.telefone}
      />
    </div>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <TextField
        label="CEP"
        type="text"
        value={fields.cep}
        onChange={(event) => setField('cep', event.target.value)}
        error={fieldErrors.cep}
      />
      <div className="sm:col-span-2">
        <TextField
          label="Logradouro"
          type="text"
          value={fields.logradouro}
          onChange={(event) => setField('logradouro', event.target.value)}
          error={fieldErrors.logradouro}
        />
      </div>
    </div>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
      <TextField
        label="Número"
        type="text"
        value={fields.numero}
        onChange={(event) => setField('numero', event.target.value)}
        error={fieldErrors.numero}
      />
      <div className="sm:col-span-2">
        <TextField
          label="Complemento"
          type="text"
          value={fields.complemento}
          onChange={(event) => setField('complemento', event.target.value)}
          error={fieldErrors.complemento}
        />
      </div>
      <TextField
        label="Bairro"
        type="text"
        value={fields.bairro}
        onChange={(event) => setField('bairro', event.target.value)}
        error={fieldErrors.bairro}
      />
    </div>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
      <div className="sm:col-span-3">
        <TextField
          label="Cidade"
          type="text"
          value={fields.cidade}
          onChange={(event) => setField('cidade', event.target.value)}
          error={fieldErrors.cidade}
        />
      </div>
      <TextField
        label="UF"
        type="text"
        maxLength={2}
        value={fields.uf}
        onChange={(event) => setField('uf', event.target.value.toUpperCase())}
        error={fieldErrors.uf}
      />
    </div>
  </>
);
