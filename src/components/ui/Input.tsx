import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id ?? label?.replace(/\s+/g, "-").toLowerCase();

    return (
      <div className="w-full space-y-1.5">
        {label ? (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-ink"
          >
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-ink shadow-sm",
            "placeholder:text-muted transition-shadow duration-200",
            "hover:border-gray-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
            error && "border-red-400 focus:border-red-500 focus:ring-red-200",
            className
          )}
          {...props}
        />
        {error ? (
          <p className="text-xs font-medium text-red-600" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
