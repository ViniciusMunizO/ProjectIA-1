import type { Produto } from '../../../../shared/src/types/produto.types';
import { Button } from '../../components/ui/Button';
import { ProdutoFormFields } from './ProdutoFormFields';
import { useProdutoEditForm } from './useProdutoEditForm';

type ProdutoEditFormProps = {
  readonly produto: Produto;
  readonly onSuccess: (produto: Produto) => void;
  readonly onCancel: () => void;
};

export const ProdutoEditForm = ({ produto, onSuccess, onCancel }: ProdutoEditFormProps) => {
  const { fields, setField, fieldErrors, formError, isSubmitting, handleSubmit } = useProdutoEditForm({
    produto,
    onSuccess,
  });

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <ProdutoFormFields fields={fields} setField={setField} fieldErrors={fieldErrors} />

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
