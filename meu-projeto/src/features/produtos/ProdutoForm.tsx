import type { Produto } from '../../../../shared/src/types/produto.types';
import { Button } from '../../components/ui/Button';
import { ProdutoFormFields } from './ProdutoFormFields';
import { useProdutoForm } from './useProdutoForm';

type ProdutoFormProps = {
  readonly onSuccess: (produto: Produto) => void;
};

export const ProdutoForm = ({ onSuccess }: ProdutoFormProps) => {
  const { fields, setField, fieldErrors, formError, isSubmitting, handleSubmit } = useProdutoForm({
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

      <Button type="submit" variant="solid" isLoading={isSubmitting} className="mt-1 w-fit">
        Cadastrar produto
      </Button>
    </form>
  );
};
