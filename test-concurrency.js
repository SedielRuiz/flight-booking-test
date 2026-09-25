// test-concurrency.js
const API_URL = 'http://localhost:4200/api';

async function testConcurrency() {
  try {
    const authHeader = 'Basic ' + Buffer.from('davivienda:flight_secret').toString('base64');
    const headers = { 'Authorization': authHeader };

    console.log('1. Buscando el primer vuelo disponible...');
    // Buscamos vuelos
    const flightsRes = await fetch(`${API_URL}/flights?page=1&limit=10`, { headers });
    const flightsData = await flightsRes.json();
    const flightId = flightsData.data[0].id;
    console.log(`Vuelo encontrado: ${flightId}`);

    console.log('2. Buscando los asientos de ese vuelo...');
    const flightDetailsRes = await fetch(`${API_URL}/flights/${flightId}`, { headers });
    const flightDetails = await flightDetailsRes.json();
    
    // Buscar el primer asiento disponible
    const seatId = flightDetails.data.seats.find(s => s.status === 'AVAILABLE').id;
    console.log(`Asiento disponible encontrado: ${seatId}`);

    console.log('\n 3. SIMULANDO 2 PETICIONES SIMULTÁNEAS PARA BLOQUEAR EL MISMO ASIENTO...\n');

    // Promesas para bloquear el asiento al mismo tiempo
    const req1 = fetch(`${API_URL}/flights/${flightId}/seats/${seatId}/lock`, { method: 'PATCH', headers });
    const req2 = fetch(`${API_URL}/flights/${flightId}/seats/${seatId}/lock`, { method: 'PATCH', headers });

    const startTime = Date.now();
    const [res1, res2] = await Promise.all([req1, req2]);
    const endTime = Date.now();

    const data1 = await res1.json();
    const data2 = await res2.json();

    console.log(` Tiempo de ejecución: ${endTime - startTime}ms`);
    console.log('==============================================');
    console.log('Petición 1 - HTTP Status:', res1.status);
    console.log('Petición 1 - Respuesta:', data1);
    console.log('==============================================');
    console.log('Petición 2 - HTTP Status:', res2.status);
    console.log('Petición 2 - Respuesta:', data2);
    console.log('==============================================');

    if ((res1.status === 200 && res2.status !== 200) || (res2.status === 200 && res1.status !== 200)) {
      console.log(' EXITO: Redis bloqueó exitosamente la concurrencia. Solo 1 petición logró bloquear el asiento.');
    } else {
      console.log(' FALLO: Ambas peticiones hicieron algo extraño.');
    }

  } catch (error) {
    console.error('Ocurrió un error en la prueba:', error);
  }
}

testConcurrency();
