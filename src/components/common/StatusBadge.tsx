import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'status' | 'priority' | 'role';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'status', size = 'sm' }) => {
  const norm = (status || '').toLowerCase().replace(/_/g, ' ');
  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  let colorClasses = 'bg-[#F0F3F5] text-[#1E252B] border-[#D6D9DF]';

  if (type === 'priority') {
    switch (norm) {
      case 'high':
        colorClasses = 'bg-[#FDF2F2] text-[#9B2C2C] border-[#FBD5D5]';
        break;
      case 'medium':
        colorClasses = 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]';
        break;
      case 'low':
        colorClasses = 'bg-[#EBF3F1] text-[#2D5851] border-[#C3DAD5]';
        break;
    }
  } else if (type === 'role') {
    if (norm === 'admin') {
      colorClasses = 'bg-[#3D766D] text-[#FDFDFE] border-[#2D5851] font-semibold';
    } else {
      colorClasses = 'bg-[#EBF3F1] text-[#3D766D] border-[#C3DAD5] font-semibold';
    }
  } else {
    switch (norm) {
      case 'approved':
      case 'completed':
      case 'active':
        colorClasses = 'bg-[#EBF3F1] text-[#2D5851] border-[#C3DAD5] font-semibold';
        break;
      case 'in progress':
      case 'upcoming':
        colorClasses = 'bg-[#EBF3F1] text-[#3D766D] border-[#D6D9DF] font-semibold';
        break;
      case 'pending':
        colorClasses = 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A] font-semibold';
        break;
      case 'cancelled':
      case 'inactive':
      case 'overdue':
        colorClasses = 'bg-[#FDF2F2] text-[#9B2C2C] border-[#FBD5D5] font-semibold';
        break;
      case 'attended':
        colorClasses = 'bg-[#F0F3F5] text-[#3D766D] border-[#BDC2C7] font-semibold';
        break;
    }
  }

  return (
    <span
      className={`inline-flex items-center font-medium capitalize rounded-md border ${sizeClasses} ${colorClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />
      {norm}
    </span>
  );
};
