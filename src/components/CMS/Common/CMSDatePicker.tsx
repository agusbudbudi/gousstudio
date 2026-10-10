import React, { useId } from "react";
import DatePicker, { DatePickerProps } from "../../../ui/DatePicker";

interface CMSDatePickerProps extends Omit<DatePickerProps, "invalid" | "className"> {
  label?: string;
  error?: string;
}

const CMSDatePicker: React.FC<CMSDatePickerProps> = ({ label, error, id: idProp, ...props }) => {
  const autoId = useId();
  const id = idProp ?? autoId;

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-ink/70 block ml-1">
          {label}
        </label>
      )}
      <DatePicker
        id={id}
        invalid={Boolean(error)}
        describedBy={error ? `${id}-error` : undefined}
        className="h-[48px] rounded-[14px] px-4 text-sm font-medium"
        panelClassName="rounded-[14px]"
        {...props}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="text-rose-600 text-xs mt-1 ml-1 font-medium">
          {error}
        </p>
      )}
    </div>
  );
};

export default CMSDatePicker;
