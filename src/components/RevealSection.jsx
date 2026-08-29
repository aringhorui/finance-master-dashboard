import { useReveal } from '../hooks/useReveal';

export function RevealSection({ children, className = '', id, delay = 0 }) {
  const ref = useReveal();

  return (
    <div
      ref={ref}
      id={id}
      className={`reveal ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
