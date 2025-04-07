import { PrismaClient } from '@prisma/client';
import { add, format } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  // Radera all existerande data för en ren start
  await prisma.$transaction([
    prisma.taskDependency.deleteMany(),
    prisma.resourceAssignment.deleteMany(),
    prisma.materialDelivery.deleteMany(),
    prisma.availabilityException.deleteMany(),
    prisma.skill.deleteMany(),
    prisma.document.deleteMany(),
    prisma.task.deleteMany(),
    prisma.phase.deleteMany(),
    prisma.projectDependency.deleteMany(),
    prisma.phaseDependency.deleteMany(),
    prisma.resource.deleteMany(),
    prisma.project.deleteMany(),
  ]);

  console.log('Databas rensad, påbörjar seed...');

  // 1. Skapa resurser (tekniker)
  const resources = await Promise.all([
    prisma.resource.create({
      data: {
        name: 'Anders Johansson',
        type: 'Tekniker',
        email: 'anders.johansson@example.com',
        phone: '070-123-4567',
        costRate: 450,
        capacity: 40,
        skills: {
          create: [
            { name: 'Rördragning', level: 5 },
            { name: 'Koppling', level: 4 },
            { name: 'Isolering', level: 3 },
          ],
        },
      },
    }),
    prisma.resource.create({
      data: {
        name: 'Maria Eriksson',
        type: 'Projektledare',
        email: 'maria.eriksson@example.com',
        phone: '070-987-6543',
        costRate: 550,
        capacity: 40,
        skills: {
          create: [
            { name: 'Projektledning', level: 5 },
            { name: 'Budgetering', level: 4 },
          ],
        },
      },
    }),
    prisma.resource.create({
      data: {
        name: 'Johan Larsson',
        type: 'Tekniker',
        email: 'johan.larsson@example.com',
        phone: '070-555-1234',
        costRate: 400,
        capacity: 40,
        skills: {
          create: [
            { name: 'Kontrollsystem', level: 5 },
            { name: 'Elkoppling', level: 4 },
          ],
        },
      },
    }),
  ]);

  console.log('Resurser skapade:', resources.length);

  // 2. Skapa ett projekt
  const projekt1 = await prisma.project.create({
    data: {
      name: 'Köpcentrum Nordstan',
      description: 'Installation av kylanläggning i Nordstan',
      customer: 'Vasakronan AB',
      manager: 'Maria Eriksson',
      startDate: new Date('2024-04-15'),
      plannedEndDate: new Date('2024-07-30'),
      status: 'Pågående',
      budget: 1200000,
      costToDate: 450000,
      estimatedTotalCost: 1250000,
    },
  });

  console.log('Projekt skapat:', projekt1.name);

  // 3. Skapa faser för projektet
  const faser = await Promise.all([
    prisma.phase.create({
      data: {
        name: 'Planering',
        description: 'Planering och förberedelse',
        projectId: projekt1.id,
        status: 'Avslutad',
        startDate: new Date('2024-04-15'),
        endDate: new Date('2024-04-30'),
        completionRate: 100,
        color: '#4CAF50',
      },
    }),
    prisma.phase.create({
      data: {
        name: 'Material',
        description: 'Beställning och leverans av material',
        projectId: projekt1.id,
        status: 'Pågående',
        startDate: new Date('2024-04-25'),
        endDate: new Date('2024-05-20'),
        completionRate: 60,
        color: '#2196F3',
      },
    }),
    prisma.phase.create({
      data: {
        name: 'Installation',
        description: 'Installation av kylsystem',
        projectId: projekt1.id,
        status: 'Ej påbörjad',
        startDate: new Date('2024-05-15'),
        endDate: new Date('2024-07-15'),
        completionRate: 0,
        color: '#FF9800',
      },
    }),
    prisma.phase.create({
      data: {
        name: 'Kontroll',
        description: 'Kvalitetskontroll och överlämning',
        projectId: projekt1.id,
        status: 'Ej påbörjad',
        startDate: new Date('2024-07-15'),
        endDate: new Date('2024-07-30'),
        completionRate: 0,
        color: '#9C27B0',
      },
    }),
  ]);

  console.log('Faser skapade:', faser.length);

  // 4. Skapa uppgifter för varje fas
  // Planeringsfasen
  const planeringsuppgifter = await Promise.all([
    prisma.task.create({
      data: {
        name: 'Behovsanalys',
        description: 'Analys av kundens behov och krav',
        projectId: projekt1.id,
        phaseId: faser[0].id,
        startDate: new Date('2024-04-15'),
        endDate: new Date('2024-04-20'),
        status: 'completed',
        priority: 'high',
        progress: 100,
        estimatedCost: 20000,
        actualCost: 18500,
      },
    }),
    prisma.task.create({
      data: {
        name: 'Dokumentförberedelse',
        description: 'Förbereda all nödvändig dokumentation',
        projectId: projekt1.id,
        phaseId: faser[0].id,
        startDate: new Date('2024-04-20'),
        endDate: new Date('2024-04-30'),
        status: 'completed',
        priority: 'medium',
        progress: 100,
        estimatedCost: 15000,
        actualCost: 14000,
      },
    }),
  ]);

  // Materialfasen
  const materialuppgifter = await Promise.all([
    prisma.task.create({
      data: {
        name: 'Beställa kompressorer',
        description: 'Beställa 5st kompressorer från leverantör',
        projectId: projekt1.id,
        phaseId: faser[1].id,
        startDate: new Date('2024-04-25'),
        endDate: new Date('2024-05-05'),
        status: 'completed',
        priority: 'high',
        progress: 100,
        estimatedCost: 350000,
        actualCost: 362000,
      },
    }),
    prisma.task.create({
      data: {
        name: 'Beställa rör och kopplingar',
        description: 'Beställa rör, kopplingar och ventiler',
        projectId: projekt1.id,
        phaseId: faser[1].id,
        startDate: new Date('2024-04-28'),
        endDate: new Date('2024-05-10'),
        status: 'in-progress',
        priority: 'medium',
        progress: 80,
        estimatedCost: 120000,
        actualCost: 95000,
      },
    }),
    prisma.task.create({
      data: {
        name: 'Beställa kontrollsystem',
        description: 'Beställa kontrollsystem och sensorer',
        projectId: projekt1.id,
        phaseId: faser[1].id,
        startDate: new Date('2024-05-05'),
        endDate: new Date('2024-05-20'),
        status: 'not-started',
        priority: 'medium',
        progress: 0,
        estimatedCost: 80000,
        actualCost: 0,
      },
    }),
  ]);

  // Installationsfasen
  const installationsuppgifter = await Promise.all([
    prisma.task.create({
      data: {
        name: 'Rördragning',
        description: 'Installation av rör och isolering',
        projectId: projekt1.id,
        phaseId: faser[2].id,
        startDate: new Date('2024-05-15'),
        endDate: new Date('2024-06-10'),
        status: 'not-started',
        priority: 'high',
        progress: 0,
        estimatedCost: 250000,
        actualCost: 0,
      },
    }),
    prisma.task.create({
      data: {
        name: 'Kompressorinstallation',
        description: 'Installation och koppling av kompressorer',
        projectId: projekt1.id,
        phaseId: faser[2].id,
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-20'),
        status: 'not-started',
        priority: 'high',
        progress: 0,
        estimatedCost: 180000,
        actualCost: 0,
      },
    }),
    prisma.task.create({
      data: {
        name: 'Kontrollsystem',
        description: 'Installation av kontroll- och styrsystem',
        projectId: projekt1.id,
        phaseId: faser[2].id,
        startDate: new Date('2024-06-15'),
        endDate: new Date('2024-07-15'),
        status: 'not-started',
        priority: 'high',
        progress: 0,
        estimatedCost: 220000,
        actualCost: 0,
      },
    }),
  ]);

  // Kontrollfasen
  const kontrolluppgifter = await Promise.all([
    prisma.task.create({
      data: {
        name: 'Trycktestning',
        description: 'Utföra trycktester på systemet',
        projectId: projekt1.id,
        phaseId: faser[3].id,
        startDate: new Date('2024-07-15'),
        endDate: new Date('2024-07-20'),
        status: 'not-started',
        priority: 'critical',
        progress: 0,
        estimatedCost: 25000,
        actualCost: 0,
        isMilestone: false,
      },
    }),
    prisma.task.create({
      data: {
        name: 'Slutbesiktning',
        description: 'Slutbesiktning med kunden',
        projectId: projekt1.id,
        phaseId: faser[3].id,
        startDate: new Date('2024-07-30'),
        endDate: new Date('2024-07-30'),
        status: 'not-started',
        priority: 'critical',
        progress: 0,
        estimatedCost: 10000,
        actualCost: 0,
        isMilestone: true,
      },
    }),
  ]);

  console.log('Uppgifter skapade:', 
    planeringsuppgifter.length + 
    materialuppgifter.length + 
    installationsuppgifter.length + 
    kontrolluppgifter.length
  );

  // 5. Skapa beroenden mellan uppgifter
  const dependencies = await Promise.all([
    // Beroendekedja i materialleveranser
    prisma.taskDependency.create({
      data: {
        predecessorId: materialuppgifter[0].id, // Beställa kompressorer
        successorId: installationsuppgifter[1].id, // Kompressorinstallation
        type: 'Slut-till-Start',
        lagDays: 5, // 5 dagars fördröjning för leverans
      },
    }),
    prisma.taskDependency.create({
      data: {
        predecessorId: materialuppgifter[1].id, // Beställa rör och kopplingar
        successorId: installationsuppgifter[0].id, // Rördragning
        type: 'Slut-till-Start',
        lagDays: 3, // 3 dagars fördröjning för leverans
      },
    }),
    prisma.taskDependency.create({
      data: {
        predecessorId: materialuppgifter[2].id, // Beställa kontrollsystem
        successorId: installationsuppgifter[2].id, // Kontrollsystem
        type: 'Slut-till-Start',
        lagDays: 10, // 10 dagars fördröjning för leverans
      },
    }),
    
    // Beroenden i installationsfasen
    prisma.taskDependency.create({
      data: {
        predecessorId: installationsuppgifter[0].id, // Rördragning
        successorId: installationsuppgifter[1].id, // Kompressorinstallation
        type: 'Start-till-Start',
        lagDays: 15, // Starta 15 dagar efter rördragningen börjar
      },
    }),
    prisma.taskDependency.create({
      data: {
        predecessorId: installationsuppgifter[1].id, // Kompressorinstallation
        successorId: installationsuppgifter[2].id, // Kontrollsystem
        type: 'Start-till-Start',
        lagDays: 15, // Starta 15 dagar efter kompressorinstallationen börjar
      },
    }),
    
    // Kontrollberoenden
    prisma.taskDependency.create({
      data: {
        predecessorId: installationsuppgifter[2].id, // Kontrollsystem
        successorId: kontrolluppgifter[0].id, // Trycktestning
        type: 'Slut-till-Start',
        lagDays: 0,
      },
    }),
    prisma.taskDependency.create({
      data: {
        predecessorId: kontrolluppgifter[0].id, // Trycktestning
        successorId: kontrolluppgifter[1].id, // Slutbesiktning
        type: 'Slut-till-Start',
        lagDays: 5, // 5 dagars mellanrum
      },
    }),
  ]);

  console.log('Beroenden skapade:', dependencies.length);

  // 6. Skapa resurstilldelningar
  const tilldelningar = await Promise.all([
    // Anders J. - Rördragning
    prisma.resourceAssignment.create({
      data: {
        resourceId: resources[0].id, // Anders Johansson
        projectId: projekt1.id,
        phaseId: faser[2].id, // Installationsfasen
        taskId: installationsuppgifter[0].id, // Rördragning
        startDate: new Date('2024-05-15'),
        endDate: new Date('2024-06-10'),
        hoursPerDay: 8,
        estimatedCost: 450 * 8 * 20, // Kostnad per timme * timmar per dag * arbetsdagar
        actualCost: 0,
      },
    }),
    // Johan L. - Kontrollsystem
    prisma.resourceAssignment.create({
      data: {
        resourceId: resources[2].id, // Johan Larsson
        projectId: projekt1.id,
        phaseId: faser[2].id, // Installationsfasen
        taskId: installationsuppgifter[2].id, // Kontrollsystem
        startDate: new Date('2024-06-15'),
        endDate: new Date('2024-07-15'),
        hoursPerDay: 8,
        estimatedCost: 400 * 8 * 22, // Kostnad per timme * timmar per dag * arbetsdagar
        actualCost: 0,
      },
    }),
    // Maria E. - Projektledning (ingen specifik uppgift, bara projektövergripande)
    prisma.resourceAssignment.create({
      data: {
        resourceId: resources[1].id, // Maria Eriksson
        projectId: projekt1.id,
        startDate: new Date('2024-04-15'),
        endDate: new Date('2024-07-30'),
        hoursPerDay: 4, // Halvtid på projektet
        estimatedCost: 550 * 4 * 75, // Kostnad per timme * timmar per dag * arbetsdagar
        actualCost: 550 * 4 * 30, // Hittills utförda dagar
      },
    }),
  ]);

  console.log('Resurstilldelningar skapade:', tilldelningar.length);

  // 7. Skapa materialleveranser
  const leveranser = await Promise.all([
    prisma.materialDelivery.create({
      data: {
        projectId: projekt1.id,
        phaseId: faser[1].id, // Materialfasen
        description: 'Kompressorer 5 st',
        supplier: 'KylTech AB',
        quantity: 5,
        unit: 'st',
        cost: 350000,
        expectedDate: new Date('2024-05-10'),
        status: 'Beställd',
        contactPerson: 'Sven Svensson',
        trackingNumber: 'KT-2024-1234',
      },
    }),
    prisma.materialDelivery.create({
      data: {
        projectId: projekt1.id,
        phaseId: faser[1].id, // Materialfasen
        description: 'Kopparrör 28mm',
        supplier: 'RörGrossisten AB',
        quantity: 200,
        unit: 'm',
        cost: 45000,
        expectedDate: new Date('2024-05-05'),
        actualDate: new Date('2024-05-03'),
        status: 'Levererad',
        contactPerson: 'Anna Andersson',
      },
    }),
    prisma.materialDelivery.create({
      data: {
        projectId: projekt1.id,
        phaseId: faser[1].id, // Materialfasen
        description: 'Kontrollsystem X500',
        supplier: 'Control Systems Inc.',
        quantity: 1,
        unit: 'st',
        cost: 78000,
        expectedDate: new Date('2024-05-25'),
        status: 'Planerad',
        contactPerson: 'John Smith',
      },
    }),
  ]);

  console.log('Materialleveranser skapade:', leveranser.length);

  console.log('Databas framgångsrikt seedat!');
}

main()
  .catch((e) => {
    console.error('Ett fel uppstod under seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 