import { type ButtonHTMLAttributes, type ReactNode } from 'react';

type Variant = 'primary' | 'outline' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-[#5244c2] to-[#7a32e0] text-white shadow-[0_2px_8px_rgba(82,68,194,0.35)] hover:scale-105 hover:shadow-[0_0_16px_rgba(82,68,194,0.55),0_4px_12px_rgba(82,68,194,0.3)]',
  outline:
    'bg-transparent text-[#5244c2] border-2 border-[#5244c2] hover:bg-[rgba(82,68,194,0.08)] hover:scale-105 hover:shadow-[0_0_12px_rgba(82,68,194,0.25)]',
  ghost:
    'bg-transparent text-[#5244c2] hover:bg-[rgba(82,68,194,0.06)] hover:scale-105',
};

export default function Button({
  variant = 'primary',
  children,
  className = '',
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`btn ${variantClasses[variant]} ${className}`}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}

/** Link styled as button — wraps an <a> tag */
interface LinkButtonProps {
  variant?: Variant;
  href: string;
  children: ReactNode;
  className?: string;
}

export function LinkButton({
  variant = 'primary',
  href,
  children,
  className = '',
}: LinkButtonProps) {
  return (
    <a
      href={href}
      className={`btn ${variantClasses[variant]} ${className}`}
    >
      {children}
    </a>
  );
}
