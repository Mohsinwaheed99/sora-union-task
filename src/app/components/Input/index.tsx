import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface BaseInputProps {
  id?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

interface TextInputProps extends BaseInputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  autoFocus?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

interface FileInputProps extends BaseInputProps {
  type: 'file';
  accept?: string;
  multiple?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

type InputProps = TextInputProps | FileInputProps;

const Input = forwardRef<HTMLInputElement, InputProps>(({
  type = 'text',
  id,
  label,
  className = '',
  disabled,
  required,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  const baseClasses =
    'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-black';
  const fileClasses =
    'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 text-black';
  const disabledClasses = disabled ? 'bg-gray-100 cursor-not-allowed' : '';

  const inputClasses = `${type === 'file' ? fileClasses : baseClasses} ${disabledClasses} ${className}`;

  const renderPasswordToggle = () => (
    <span
      onClick={() => setShowPassword((prev) => !prev)}
      className="absolute inset-y-0 right-0 cursor-pointer flex items-center px-3 text-gray-500 focus:outline-none"
      tabIndex={-1}
    >
      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
    </span>
  );

  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          type={type === 'password' && showPassword ? 'text' : type}
          id={id}
          required={required}
          disabled={disabled}
          className={inputClasses}
          {...props}
        />
        {type === 'password' && renderPasswordToggle()}
      </div>
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
