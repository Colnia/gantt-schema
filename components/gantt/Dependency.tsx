import React from 'react';

interface DependencyProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color?: string;
  strokeWidth?: number;
  arrowSize?: number;
}

// Definiera komponenten
const DependencyLineComponent: React.FC<DependencyProps> = ({
  startX,
  startY,
  endX,
  endY,
  color = '#666',
  strokeWidth = 1.5,
  arrowSize = 5,
}) => {
  // Enkel rak linje med pilspets
  // För mer avancerade linjer (t.ex. med böjar) krävs mer komplex SVG-path
  const pathData = `M ${startX} ${startY} L ${endX} ${endY}`;
  const arrowPath = `M ${endX - arrowSize} ${endY - arrowSize / 2} L ${endX} ${endY} L ${endX - arrowSize} ${endY + arrowSize / 2}`;

  return (
    <>
      <path
        d={pathData}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <path
        d={arrowPath}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
      />
    </>
  );
};

// Exportera den memoized versionen
export const DependencyLine = React.memo(DependencyLineComponent); 