import { EvidenceStatus } from '@/lib/types';
import { evidenceMeta } from '@/lib/evidence';
import { FileCheck } from 'lucide-react';

const STATUS_STYLES: Record<EvidenceStatus, string> = {
  direct: 'bg-[#EEEDFE] text-[#3F4FBF] border-[#3F4FBF]/25',
  official: 'bg-[#E6F1FB] text-[#2E3B94] border-[#3F4FBF]/20',
  reputable_third_party: 'bg-[#F8F9FB] text-[#1E2A3A] border-[#E3E5E9]',
  secondary: 'bg-[#F8F9FB] text-[#5B6472] border-[#E3E5E9]',
  community_submitted: 'bg-[#F8F9FB] text-[#8A93A3] border-[#E3E5E9]',
};

export default function EvidenceStatusBadge({ status }: { status: EvidenceStatus }) {
  const meta = evidenceMeta(status);
  return (
    <span
      title={meta.hint}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11.5px] font-semibold border ${STATUS_STYLES[status]}`}
    >
      <FileCheck className="w-3 h-3 shrink-0 opacity-80" />
      {meta.label}
    </span>
  );
}
