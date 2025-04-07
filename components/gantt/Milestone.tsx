// Placeholder for Milestone component
import React from 'react';
// import { Task } from '@/lib/types'; <-- Ta bort Task-import
import { Milestone as MilestoneType } from '@/lib/types'; // Importera Milestone-typen och ge den ett alias
import { Milestone as MilestoneIcon } from 'lucide-react';

interface MilestoneProps {
  // task: Task; <-- Ändra från task till milestone
  milestone: MilestoneType;
  left: number;
  // Add other necessary props like dayWidth, event handlers if needed
}

// export const Milestone: React.FC<MilestoneProps> = ({ task, left }) => { <-- Ändra prop-namn
const MilestoneComponent: React.FC<MilestoneProps> = ({ milestone, left }) => {
  // Basic rendering logic - this will be refined based on gantt-chart.tsx
  const style = {
    position: 'absolute' as const,
    left: `${left}px`,
    top: `5px`, // Adjust top position as needed
    transform: 'translateX(-50%)', // Center the flag icon
    zIndex: 20, // Ensure it's above grid lines but potentially below task bars if needed
  };

  return (
    // <div style={style} title={`${task.name} (Milestone)`}> <-- Uppdatera title
    <div style={style} title={`${milestone.name} (Milestone - ${milestone.date})`}>
      <MilestoneIcon className="h-6 w-6 text-gray-700" /> {/* Ändrar till Milestone-ikon med större storlek och mörkare färg */}
    </div>
  );
};

// Exportera den memoized versionen
export const Milestone = React.memo(MilestoneComponent); 