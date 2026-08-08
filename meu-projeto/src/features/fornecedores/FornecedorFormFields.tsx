import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import type { FornecedorFieldErrors, FornecedorFormFieldsState } from './fornecedor-form-state';

type FornecedorFormFieldsProps = {
  readonly fields: FornecedorFormFieldsState;
  readonly setField: <K extends keyof FornecedorFormFieldsState>(key: K, value: FornecedorFormFieldsState[K]) => void;
  readonly fieldErrors: FornecedorFieldErrors;
  readonly onCnpjChange: (value: string) => void;
  readonly isLookingUpCnpj: boolean;
  readonly onCnpjLookup: () => void;
};

export const FornecedorFormFields = ({
  fields,
  setField,
  fieldErrors,
  onCnpjChange,
  isLookingUpCnpj,
  onCnpjLookup,
}: FornecedorFormFieldsProps) => (
  <>
    <div className="flex items-end gap-2">
      <div className="flex-1">
        <TextField
          label="CNPJ"
          type="text"
          inputMode="numeric"
          placeholder="00.000.000/0000-00"
          value={fields.cnpj}
          onChange={(event) => onCnpjChange(event.target.value)}
          error={fieldErrors.cnpj}
        />
      </div>
      <Button type="button" variant="ghost" isLoading={isLookingUpCnpj} onClick={onCnpjLookup}>
        Buscar
      </Button>
    </div>

    <TextField
      label="Razão social"
      type="text"
      value={fields.razaoSocial}
      onChange={(event) => setField('razaoSocial', event.target.value)}
      error={fieldErrors.razaoSocial}
    />

    <TextField
      label="Nome fantasia (opcional)"
      type="text"
      value={fields.nomeFantasia}
      onChange={(event) => setField('nomeFantasia', event.target.value)}
      error={fieldErrors.nomeFantasia}
    />

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
