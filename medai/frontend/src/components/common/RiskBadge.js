import React from 'react';
import { getRiskBadgeClass, getRiskColor } from '../../utils/helpers';

const RiskBadge = ({ risk, size = 'normal' }) => {
  if (!risk) return null;
  return (
    <span className={getRiskBadgeClass(risk)} style={{
      fontSize: size === 'sm' ? '0.72rem' : '0.8rem',
      padding: size === 'sm' ? '2px 8px' : '4px 12px'
    }}>
      <span style={{
        display: 'inline-block', width: 6, height: 6,
        borderRadius: '50%', background: getRiskColor(risk), marginRight: 5
      }}/>
      {risk}
    </span>
  );
};

export default RiskBadge;
