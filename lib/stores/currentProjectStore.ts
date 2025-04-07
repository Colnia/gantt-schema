import { create, StateCreator } from 'zustand';
import { Project, Task, MaterialDelivery } from '@/lib/types'; // Adjust import path if needed

// Export the interface
export interface CurrentProjectState {
  project: Project | null;
  tasks: Task[];
  materialDeliveries: MaterialDelivery[];
  isLoading: boolean;
  error: string | null;
  loadProjectStart: () => void;
  setProjectData: (projectData: Project | null, error?: string | null) => void;
  // Add action to update material visibility
  updateMaterialShowOnGantt: (materialId: string, show: boolean) => void;
  // TODO: Add actions for updating/adding/deleting tasks later
  // updateTask: (updatedTask: Task) => void;
  // addTask: (newTask: Task) => void;
  // deleteTask: (taskId: string) => void;
}

// Define the store creator with explicit types (Only ONCE)
const storeCreator: StateCreator<CurrentProjectState> = (set) => ({
  project: null,
  tasks: [],
  materialDeliveries: [],
  isLoading: true,
  error: null,
  loadProjectStart: () => set({
    isLoading: true,
    error: null,
    project: null,
    tasks: [],
    materialDeliveries: [],
  }),
  setProjectData: (projectData: Project | null, error = null) => {
    set({
        project: projectData,
        tasks: projectData?.tasks ?? [], // Extract tasks from project data
        materialDeliveries: projectData?.materialDeliveries ?? [],
        isLoading: false,
        error: error,
    });
  },
  // Implement the new action
  updateMaterialShowOnGantt: (materialId, show) => set((state) => ({
    materialDeliveries: state.materialDeliveries.map((item) => 
      item.id === materialId ? { ...item, showOnGantt: show } : item
    ),
  })),
  // --- Placeholder Actions (Implement later) ---
  // updateTask: (updatedTask) => set((state) => ({
  //   tasks: state.tasks.map((task) =>
  //     task.id === updatedTask.id ? updatedTask : task
  //   ),
  // })),
  // addTask: (newTask) => set((state) => ({
  //   tasks: [...state.tasks, newTask],
  // })),
  // deleteTask: (taskId) => set((state) => ({
  //   tasks: state.tasks.filter((task) => task.id !== taskId),
  // })),
});

// Create the store using the typed creator
export const useCurrentProjectStore = create<CurrentProjectState>(storeCreator);

// Optional: Selector hooks with explicit state type
export const useCurrentProject = () => useCurrentProjectStore((state: CurrentProjectState) => state.project);
export const useCurrentProjectTasks = () => useCurrentProjectStore((state: CurrentProjectState) => state.tasks);
export const useCurrentProjectMaterials = () => useCurrentProjectStore((state: CurrentProjectState) => state.materialDeliveries);
export const useCurrentProjectLoadingState = () => useCurrentProjectStore((state: CurrentProjectState) => ({
    isLoading: state.isLoading,
    error: state.error,
}));
