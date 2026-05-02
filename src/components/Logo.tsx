import { useTheme } from '../contexts/ThemeContext';

interface LogoProps {
  className?: string;
}

export const Logo = ({ className = 'h-8 w-auto' }: LogoProps) => {
  const { theme } = useTheme();
  return (
    <img
      src={theme === 'dark' ? '/quantedge-logo.svg' : '/quantedge-logo-light.svg'}
      alt="QuantEdge"
      className={className}
    />
  );
};
