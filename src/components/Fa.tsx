'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

type FaProps = {
  icon: IconDefinition;
  className?: string;
};

export default function Fa({ icon, className }: FaProps) {
  return (
    <span className={`inline-flex shrink-0 items-center justify-center ${className ?? ''}`}>
      <FontAwesomeIcon icon={icon} style={{ width: '100%', height: '100%' }} />
    </span>
  );
}
