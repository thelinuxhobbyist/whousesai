import { EvidenceStatus } from '@/lib/types';
import { EVIDENCE_STATUSES } from '@/lib/evidence';

export default function EvidenceStatusSelect({
  value,
  onChange,
}: {
  value?: EvidenceStatus;
  onChange: (value: EvidenceStatus | undefined) => void;
}) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-[#8A93A3] uppercase tracking-wider mb-1">
        Evidence strength
      </label>
      <select
        value={value || ''}
        onChange={(e) => onChange((e.target.value || undefined) as EvidenceStatus | undefined)}
        className="w-full rounded bg-[#F8F9FB] border border-[#E3E5E9] px-3 py-1.5 text-sm text-[#1E2A3A] focus:border-[#3F4FBF] focus:outline-none"
      >
        <option value="">Infer from source</option>
        {EVIDENCE_STATUSES.map((status) => (
          <option key={status.id} value={status.id}>
            {status.label} — {status.hint}
          </option>
        ))}
      </select>
    </div>
  );
}
