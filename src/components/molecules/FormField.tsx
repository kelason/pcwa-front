import React from 'react';

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
}

/**
 * FormField Molecule: Encapsulates a label and its associated input or select element.
 */
export const FormField: React.FC<FormFieldProps> = ({ label, children }) => {
  return (
    <div className="relative mt-2">
      {children}
      <label className="absolute left-2 -top-2.5 px-1 bg-white text-[12px] text-blue-600 font-medium transition-all duration-200 
        pointer-events-none
        peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:font-normal peer-placeholder-shown:bg-transparent
        peer-focus:-top-2.5 peer-focus:left-2 peer-focus:text-[12px] peer-focus:text-blue-600 peer-focus:bg-white peer-focus:font-medium">
        {label}
      </label>
    </div>
  );
};

/**
 * Shared Tailwind classes for form inputs and selects to maintain UI consistency.
 */
export const FORM_INPUT_CLASSES = "peer w-full border-2 border-gray-200 rounded p-3.5 text-gray-900 outline-none bg-transparent focus:border-blue-500 transition-all";