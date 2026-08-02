import { useEffect, useId, useRef, useState, type DragEvent } from 'react';
import { formatFileSize } from '../../lib/file-validation';

type FileDropInputProps = {
  readonly file: File | null;
  readonly error?: string;
  readonly onFileChange: (file: File | null) => void;
};

export const FileDropInput = ({ file, error, onFileChange }: FileDropInputProps) => {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  useEffect(() => {
    if (!file && inputRef.current) {
      inputRef.current.value = '';
    }
  }, [file]);

  const handleDrop = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    setIsDragActive(false);
    onFileChange(event.dataTransfer.files[0] ?? null);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-[var(--text)]">Documento (PDF ou Word)</span>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragActive(true);
        }}
        onDragLeave={() => setIsDragActive(false)}
        onDrop={handleDrop}
        className={`flex min-h-24 flex-col items-center justify-center gap-1 rounded-xl border border-dashed px-4 py-4 text-center transition-[border-color,background-color] duration-150 ease-out ${
          isDragActive ? 'border-[var(--accent)] bg-[var(--accent-bg)]' : 'border-[var(--border)]'
        }`}
      >
        {file ? (
          <div className="flex w-full items-center justify-between gap-3 text-sm">
            <span className="truncate text-[var(--text-h)]">{file.name}</span>
            <div className="flex items-center gap-1">
              <span className="tabular-nums text-xs text-[var(--text)]">
                {formatFileSize(file.size)}
              </span>
              <button
                type="button"
                onClick={() => onFileChange(null)}
                aria-label="Remover arquivo"
                className="flex size-10 items-center justify-center rounded-full text-lg text-[var(--text)] transition-colors duration-150 hover:bg-black/5"
              >
                ×
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-[var(--text)]">Arraste um arquivo ou</p>
            <label
              htmlFor={inputId}
              className="relative cursor-pointer py-1 text-sm font-medium text-[var(--accent)] underline underline-offset-2 after:absolute after:-inset-x-2 after:-inset-y-3 after:content-['']"
            >
              escolha no computador
            </label>
          </>
        )}
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
        />
      </div>

      {error ? (
        <p className="text-xs text-red-500" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
};
