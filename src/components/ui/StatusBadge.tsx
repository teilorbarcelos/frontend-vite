import { useAuth } from '@/hooks/useAuth';

interface StatusBadgeProps {
  active: boolean;
  feature: string;
  onClick?: () => void;
}

export function StatusBadge({ active, feature, onClick }: StatusBadgeProps) {
  const { hasPermission } = useAuth();
  const canActivate = hasPermission(feature, 'activate');

  const handleClick = () => {
    if (canActivate && onClick) {
      onClick();
    }
  };

  const activeClass = active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  let hoverClass = 'cursor-not-allowed opacity-70';
  if (canActivate) {
    hoverClass = `cursor-pointer hover:ring-2 hover:ring-offset-1 ${active ? 'hover:ring-green-300' : 'hover:ring-red-300'}`;
  }

  return (
    <button
      onClick={handleClick}
      disabled={!canActivate}
      type="button"
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full transition-all ${activeClass} ${hoverClass}`}
    >
      {active ? 'Ativo' : 'Inativo'}
    </button>
  );
}
