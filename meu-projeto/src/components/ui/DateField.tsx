import { useEffect, useState, type ChangeEvent } from 'react';
import { displayToIso, isoToDisplay, maskDateInput } from '../../lib/date-mask';
import { TextField } from './TextField';

type DateFieldProps = {
  readonly label: string;
  readonly value: string;
  readonly onChange: (isoValue: string) => void;
  readonly error?: string;
};

export const DateField = ({ label, value, onChange, error }: DateFieldProps) => {
  const [display, setDisplay] = useState(() => isoToDisplay(value));

  useEffect(() => {
    setDisplay(isoToDisplay(value));
  }, [value]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const masked = maskDateInput(event.target.value);
    setDisplay(masked);
    onChange(displayToIso(masked));
  };

  return (
    <TextField
      label={label}
      type="text"
      inputMode="numeric"
      placeholder="dd/mm/aaaa"
      maxLength={10}
      value={display}
      onChange={handleChange}
      error={error}
    />
  );
};
