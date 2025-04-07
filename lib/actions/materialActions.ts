'use server';

import prisma from "@/lib/prisma";
import { revalidatePath } from 'next/cache';

export async function updateMaterialVisibility(materialId: string, show: boolean, projectId: string) {
    console.log(`Server Action: Updating material ${materialId} to showOnGantt: ${show}`);
    try {
        await prisma.materialDelivery.update({
            where: { id: materialId },
            data: { showOnGantt: show },
        });
        // Revalidate the project page path after successful update
        revalidatePath(`/gantt/${projectId}`); 
        console.log(`Server Action: Revalidated path /gantt/${projectId}`);
        return { success: true };
    } catch (error) {
        console.error("Server Action Error updating material visibility:", error);
        return { success: false, error: "Kunde inte uppdatera materialets synlighet." };
    }
} 