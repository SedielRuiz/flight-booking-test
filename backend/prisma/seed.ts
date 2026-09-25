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
  const bog = await prisma.city.create({
    data: { code: 'BOG', name: 'Bogotá' },
  });
  const mde = await prisma.city.create({
    data: { code: 'MDE', name: 'Medellín' },
  });
  const ctg = await prisma.city.create({
    data: { code: 'CTG', name: 'Cartagena' },
  });
  const clo = await prisma.city.create({ data: { code: 'CLO', name: 'Cali' } });

  console.log(`4 cities created`);

  // Crear vuelos
  const flights = await Promise.all([
    prisma.flight.create({
      data: {
        flightNumber: 'AV-1001',
        originId: bog.id,
        destinationId: mde.id,
        departureTime: new Date('2026-09-25T06:00:00Z'),
        arrivalTime: new Date('2026-09-25T07:15:00Z'),
        price: 189000,
      },
    }),
    prisma.flight.create({
      data: {
        flightNumber: 'AV-1002',
        originId: mde.id,
        destinationId: bog.id,
        departureTime: new Date('2026-09-26T18:30:00Z'),
        arrivalTime: new Date('2026-09-26T19:45:00Z'),
        price: 195000,
      },
    }),
    prisma.flight.create({
      data: {
        flightNumber: 'AV-2010',
        originId: bog.id,
        destinationId: ctg.id,
        departureTime: new Date('2026-09-25T08:00:00Z'),
        arrivalTime: new Date('2026-09-25T09:45:00Z'),
        price: 245000,
      },
    }),
    prisma.flight.create({
      data: {
        flightNumber: 'AV-2011',
        originId: ctg.id,
        destinationId: bog.id,
        departureTime: new Date('2026-09-27T14:00:00Z'),
        arrivalTime: new Date('2026-09-27T15:45:00Z'),
        price: 260000,
      },
    }),
    prisma.flight.create({
      data: {
        flightNumber: 'AV-3050',
        originId: bog.id,
        destinationId: clo.id,
        departureTime: new Date('2026-09-28T10:30:00Z'),
        arrivalTime: new Date('2026-09-28T11:40:00Z'),
        price: 175000,
      },
    }),
    prisma.flight.create({
      data: {
        flightNumber: 'AV-3051',
        originId: clo.id,
        destinationId: mde.id,
        departureTime: new Date('2026-09-26T07:00:00Z'),
        arrivalTime: new Date('2026-09-26T08:00:00Z'),
        price: 165000,
      },
    }),
    prisma.flight.create({
      data: {
        flightNumber: 'AV-9999',
        originId: bog.id,
        destinationId: mde.id,
        departureTime: new Date('2026-10-01T10:00:00Z'),
        arrivalTime: new Date('2026-10-01T11:00:00Z'),
        price: 500000,
      },
    }),
  ]);

  console.log(`${flights.length} flights created`);

  // Crear asientos para cada vuelo (filas 1-5, columnas A-F = 30 asientos por vuelo)
  const columns = ['A', 'B', 'C', 'D', 'E', 'F'];
  const rows = [1, 2, 3, 4, 5];

  let totalSeats = 0;

  for (const flight of flights) {
    const seatsData = [];

    if (flight.flightNumber === 'AV-9999') {
      // Solo 2 asientos para este vuelo de prueba
      seatsData.push({
        seatNumber: '1A',
        status: SeatStatus.AVAILABLE,
        flightId: flight.id,
      });
      seatsData.push({
        seatNumber: '1B',
        status: SeatStatus.AVAILABLE,
        flightId: flight.id,
      });
    } else {
      for (const row of rows) {
        for (const col of columns) {
          seatsData.push({
            seatNumber: `${row}${col}`,
            status: SeatStatus.AVAILABLE,
            flightId: flight.id,
          });
        }
      }
    }

    await prisma.seat.createMany({ data: seatsData });
    totalSeats += seatsData.length;
  }

  console.log(
    `✅ ${totalSeats} seats created (${rows.length * columns.length} per flight)`,
  );

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
