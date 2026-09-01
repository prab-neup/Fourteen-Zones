import type { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost';
};

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  const classes = ['button', variant === 'ghost' ? 'ghost' : '', className]
    .filter(Boolean)
    .join(' ');

  return <button className={classes} {...props} />;
}
