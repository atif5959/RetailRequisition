import Link from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';

type ButtonDesign = 'default' | 'danger';

const buttonDesigns: Record<ButtonDesign, string> = {
  default: 'app-button-default',
  danger: 'app-button-danger',
};

const baseClasses = 'inline-flex items-center justify-center gap-2 transition disabled:cursor-not-allowed disabled:opacity-60';

const buttonStyles: Record<ButtonDesign, CSSProperties> = {
  default: {
    backgroundColor: '#3b82f6',
    borderRadius: '9999px',
    color: '#ffffff',
    fontWeight: 700,
    padding: '0.5rem 1rem',
  },
  danger: {
    backgroundColor: '#dc2626',
    borderRadius: '9999px',
    color: '#ffffff',
    fontWeight: 700,
    padding: '0.5rem 1rem',
  },
};

type CommonProps = {
  children: ReactNode;
  className?: string;
  designKey?: ButtonDesign;
};

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement>;

type ButtonLinkProps = CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
};

function buttonClassName(designKey: ButtonDesign = 'default', className = '') {
  return `${baseClasses} ${buttonDesigns[designKey]} ${className}`.trim();
}

export function AppButton({ children, className, designKey = 'default', type = 'button', style, ...props }: ButtonProps) {
  return (
    <button type={type} className={buttonClassName(designKey, className)} style={{ ...buttonStyles[designKey], ...style }} {...props}>
      {children}
    </button>
  );
}

export function AppButtonLink({ children, className, designKey = 'default', href, style, ...props }: ButtonLinkProps) {
  return (
    <Link href={href} className={buttonClassName(designKey, className)} style={{ ...buttonStyles[designKey], ...style }} {...props}>
      {children}
    </Link>
  );
}
