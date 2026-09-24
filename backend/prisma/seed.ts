import { PrismaClient, SeatStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Limpiar datos existentes (orden por FK)
  await prisma.ticket.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.flight.deleteMany();
  await prisma.city.deleteMany();
  await prisma.user.deleteMany();

  // Crear ciudades
  const bog = await prisma.city.create({ data: { code: 'BOG', name: 'Bogotá' } });
  const mde = await prisma.city.create({ data: { code: 'MDE', name: 'Medellín' } });
  const ctg = await prisma.city.create({ data: { code: 'CTG', name: 'Cartagena' } });
  const clo = await prisma.city.create({ data: { code: 'CLO', name: 'Cali' } });

  console.log(`✅ 4 cities created`);

  // Crear vuelos
  const flights = await Promise.all([
    prisma.flight.create({
      data: {
        flightNumber: 'AV-1001',
        originId: bog.id,
        destinationId: mde.id,
        departureTime: new Date('2026-10-15T06:00:00Z'),
        arrivalTime: new Date('2026-10-15T07:15:00Z'),
        price: 189000,
      },
    }),
    prisma.flight.create({
      data: {
        flightNumber: 'AV-1002',
        originId: mde.id,
        destinationId: bog.id,
        departureTime: new Date('2026-10-15T18:30:00Z'),
        arrivalTime: new Date('2026-10-15T19:45:00Z'),
        price: 195000,
      },
    }),
    prisma.flight.create({
      data: {
        flightNumber: 'AV-2010',
        originId: bog.id,
        destinationId: ctg.id,
        departureTime: new Date('2026-10-15T08:00:00Z'),
        arrivalTime: new Date('2026-10-15T09:45:00Z'),
        price: 245000,
      },
    }),
    prisma.flight.create({
      data: {
        flightNumber: 'AV-2011',
        originId: ctg.id,
        destinationId: bog.id,
        departureTime: new Date('2026-10-16T14:00:00Z'),
        arrivalTime: new Date('2026-10-16T15:45:00Z'),
        price: 260000,
      },
    }),
    prisma.flight.create({
      data: {
        flightNumber: 'AV-3050',
        originId: bog.id,
        destinationId: clo.id,
        departureTime: new Date('2026-10-15T10:30:00Z'),
        arrivalTime: new Date('2026-10-15T11:40:00Z'),
        price: 175000,
      },
    }),
    prisma.flight.create({
      data: {
        flightNumber: 'AV-3051',
        originId: clo.id,
        destinationId: mde.id,
        departureTime: new Date('2026-10-16T07:00:00Z'),
        arrivalTime: new Date('2026-10-16T08:00:00Z'),
        price: 165000,
      },
    }),
  ]);

  console.log(`✅ ${flights.length} flights created`);

  // Crear asientos para cada vuelo (filas 1-5, columnas A-F = 30 asientos por vuelo)
  const columns = ['A', 'B', 'C', 'D', 'E', 'F'];
  const rows = [1, 2, 3, 4, 5];

  let totalSeats = 0;

  for (const flight of flights) {
    const seatsData = [];

    for (const row of rows) {
      for (const col of columns) {
        seatsData.push({
          seatNumber: `${row}${col}`,
          status: SeatStatus.AVAILABLE,
          flightId: flight.id,
        });
      }
    }

    await prisma.seat.createMany({ data: seatsData });
    totalSeats += seatsData.length;
  }

  console.log(`✅ ${totalSeats} seats created (${rows.length * columns.length} per flight)`);

  // Crear usuario de prueba
  await prisma.user.create({
    data: {
      email: 'test@davivienda.com',
      name: 'Usuario de Prueba',
    },
  });

  console.log('✅ Test user created');
  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
