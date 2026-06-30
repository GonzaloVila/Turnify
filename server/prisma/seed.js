require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

function monthDate(monthOffset, day, h, m) {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + monthOffset);
  const maxDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, maxDay));
  d.setHours(h, m, 0, 0);
  return d;
}

function dayDate(daysOffset, h, m) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(h, m, 0, 0);
  return d;
}

async function main() {
  console.log('Seeding database...\n');

  // ── Negocio ──
  const negocio = await prisma.negocio.upsert({
    where: { slug: 'demo-salon' },
    update: {},
    create: {
      nombre: 'Salon Demo',
      email: 'salon@demo.com',
      telefono: '+54 11 1234-5678',
      slug: 'demo-salon',
      descripcion: 'Salon de belleza y barberia — cuenta de demostracion',
      direccion: 'Av. Corrientes 1234, Buenos Aires',
    },
  });

  // ── Usuarios ──
  const hash = await bcrypt.hash('demo1234', 10);

  await prisma.usuario.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      negocio_id: negocio.id,
      nombre: 'Admin Demo',
      email: 'admin@demo.com',
      password_hash: hash,
      rol: 'SUPER_ADMIN',
    },
  });

  await prisma.usuario.upsert({
    where: { email: 'roberto@demo.com' },
    update: {},
    create: {
      negocio_id: negocio.id,
      nombre: 'Roberto Fernandez',
      email: 'roberto@demo.com',
      password_hash: hash,
      rol: 'ADMIN',
    },
  });

  // ── Servicios (8) ──
  const srvDefs = [
    { id: 'seed-srv-corte', nombre: 'Corte de cabello', duracion_min: 30, precio: 3500, color: '#3b82f6', descripcion: 'Corte personalizado con lavado incluido' },
    { id: 'seed-srv-color', nombre: 'Coloracion completa', duracion_min: 90, precio: 12000, color: '#f59e0b', descripcion: 'Coloracion profesional con productos premium' },
    { id: 'seed-srv-mani', nombre: 'Manicuria', duracion_min: 45, precio: 4500, color: '#ec4899', descripcion: 'Manicuria tradicional o semipermanente' },
    { id: 'seed-srv-barba', nombre: 'Arreglo de barba', duracion_min: 20, precio: 2500, color: '#10b981', descripcion: 'Perfilado y recorte de barba' },
    { id: 'seed-srv-lavado', nombre: 'Lavado y peinado', duracion_min: 25, precio: 2000, color: '#8b5cf6', descripcion: 'Lavado con masaje capilar y peinado' },
    { id: 'seed-srv-brushing', nombre: 'Brushing', duracion_min: 40, precio: 4000, color: '#06b6d4', descripcion: 'Secado y modelado con cepillo' },
    { id: 'seed-srv-alisado', nombre: 'Alisado keratina', duracion_min: 120, precio: 18000, color: '#f97316', descripcion: 'Tratamiento de keratina profesional' },
    { id: 'seed-srv-depilacion', nombre: 'Depilacion facial', duracion_min: 15, precio: 1800, color: '#64748b', descripcion: 'Depilacion con cera de cejas y bozo' },
  ];

  for (const s of srvDefs) {
    await prisma.servicio.upsert({
      where: { id: s.id },
      update: { descripcion: s.descripcion },
      create: { ...s, negocio_id: negocio.id },
    });
  }

  // ── Profesionales (4) ──
  const profDefs = [
    { id: 'seed-prof-lucia', nombre: 'Lucia Gomez', especialidad: 'Colorista' },
    { id: 'seed-prof-martin', nombre: 'Martin Lopez', especialidad: 'Barbero' },
    { id: 'seed-prof-ana', nombre: 'Ana Rodriguez', especialidad: 'Estilista' },
    { id: 'seed-prof-diego', nombre: 'Diego Sanchez', especialidad: 'Barbero' },
  ];

  for (const p of profDefs) {
    await prisma.profesional.upsert({
      where: { id: p.id },
      update: {},
      create: { ...p, negocio_id: negocio.id },
    });
  }

  // ── Horarios ──
  const horarios = [
    { profId: 'seed-prof-lucia', dias: [1, 2, 3, 4, 5, 6], inicio: '09:00', fin: '18:00' },
    { profId: 'seed-prof-martin', dias: [1, 2, 3, 4, 5], inicio: '10:00', fin: '19:00' },
    { profId: 'seed-prof-ana', dias: [1, 2, 3, 4, 5, 6], inicio: '09:00', fin: '17:00' },
    { profId: 'seed-prof-diego', dias: [2, 3, 4, 5, 6], inicio: '10:00', fin: '20:00' },
  ];

  for (const h of horarios) {
    for (const dia of h.dias) {
      await prisma.horarioDisponible.upsert({
        where: { id: `seed-horario-${h.profId}-${dia}` },
        update: {},
        create: {
          id: `seed-horario-${h.profId}-${dia}`,
          profesional_id: h.profId,
          dia_semana: dia,
          hora_inicio: h.inicio,
          hora_fin: h.fin,
        },
      });
    }
  }

  // ── Clientes (12) — con created_at distribuido para reportes ──
  const cliDefs = [
    { id: 'seed-cli-sofia', nombre: 'Sofia Ramirez', email: 'sofia@mail.com', telefono: '11 2233-4455', meses: 5 },
    { id: 'seed-cli-carlos', nombre: 'Carlos Mendez', email: null, telefono: '11 5566-7788', meses: 5 },
    { id: 'seed-cli-valentina', nombre: 'Valentina Torres', email: 'valen@mail.com', telefono: null, meses: 4 },
    { id: 'seed-cli-alejandro', nombre: 'Alejandro Ruiz', email: 'alejandro.ruiz@mail.com', telefono: '11 3344-5566', meses: 4 },
    { id: 'seed-cli-camila', nombre: 'Camila Herrera', email: 'camila.h@mail.com', telefono: '11 9988-7766', meses: 3 },
    { id: 'seed-cli-matias', nombre: 'Matias Fernandez', email: null, telefono: '11 4455-6677', meses: 3 },
    { id: 'seed-cli-isabella', nombre: 'Isabella Lopez', email: 'isa.lopez@mail.com', telefono: '11 8877-6655', meses: 2 },
    { id: 'seed-cli-tomas', nombre: 'Tomas Garcia', email: 'tomas.g@mail.com', telefono: null, meses: 2 },
    { id: 'seed-cli-florencia', nombre: 'Florencia Diaz', email: 'flor.diaz@mail.com', telefono: '11 1122-3344', meses: 1 },
    { id: 'seed-cli-joaquin', nombre: 'Joaquin Morales', email: null, telefono: '11 5544-3322', meses: 1 },
    { id: 'seed-cli-luciana', nombre: 'Luciana Castro', email: 'luciana.c@mail.com', telefono: '11 6677-8899', meses: 0 },
    { id: 'seed-cli-nicolas', nombre: 'Nicolas Peralta', email: 'nico.peralta@mail.com', telefono: '11 2211-4433', meses: 0 },
  ];

  for (const c of cliDefs) {
    const { meses, ...data } = c;
    const createData = { negocio_id: negocio.id, nombre: data.nombre, telefono: data.telefono };
    if (data.email) createData.email = data.email;

    await prisma.cliente.upsert({
      where: { id: data.id },
      update: {},
      create: { id: data.id, ...createData },
    });

    const createdAt = monthDate(-meses, 5 + Math.floor(Math.abs(data.id.charCodeAt(9)) % 20), 10, 0);
    await prisma.cliente.update({
      where: { id: data.id },
      data: { created_at: createdAt },
    });
  }

  // ── Turnos ──
  await prisma.turno.deleteMany({ where: { id: { startsWith: 'seed-turno-' } } });

  const profIds = profDefs.map((p) => p.id);
  const srvIds = srvDefs.map((s) => s.id);
  const cliIds = cliDefs.map((c) => c.id);
  const turnos = [];
  let idx = 0;

  function addTurno(inicio, profIdx, srvIdx, cliIdx, estado, origen) {
    const dur = srvDefs[srvIdx].duracion_min;
    const fin = new Date(inicio.getTime() + dur * 60000);
    idx++;
    turnos.push({
      id: `seed-turno-${String(idx).padStart(3, '0')}`,
      negocio_id: negocio.id,
      profesional_id: profIds[profIdx % 4],
      servicio_id: srvIds[srvIdx % 8],
      cliente_id: cliIds[cliIdx % 12],
      fecha_hora_inicio: inicio,
      fecha_hora_fin: fin,
      estado,
      origen: origen || 'MANUAL',
    });
  }

  // ── Meses pasados (para graficos de ingresos) ──
  for (let mb = 5; mb >= 1; mb--) {
    const count = 8 + (5 - mb) * 2;
    for (let j = 0; j < count; j++) {
      const day = 2 + j * 2;
      if (day > 28) continue;
      const hour = 9 + (j % 5) * 2;
      const estado = j % 8 === 0 ? 'CANCELADO' : 'COMPLETADO';
      addTurno(monthDate(-mb, day, hour, 0), j % 4, j % 8, (j + mb) % 12, estado, j % 3 === 0 ? 'WEB' : 'MANUAL');
    }
  }

  // ── Ultimos 10 dias ──
  for (let dAgo = 10; dAgo >= 1; dAgo--) {
    const slots = [
      [9, 0, 0, 0], [10, 0, 1, 3], [10, 30, 2, 4], [11, 0, 0, 1],
      [14, 0, 3, 0], [15, 0, 1, 5], [16, 0, 2, 2],
    ];
    slots.forEach(([h, m, pIdx, sIdx], j) => {
      const estado = dAgo % 5 === 0 && j === 3 ? 'CANCELADO'
        : dAgo % 7 === 0 && j === 4 ? 'AUSENTE'
        : 'COMPLETADO';
      addTurno(dayDate(-dAgo, h, m), pIdx, sIdx, (dAgo + j) % 12, estado, j % 2 === 0 ? 'WEB' : 'MANUAL');
    });
  }

  // ── Hoy (10 turnos) ──
  const hoySlots = [
    { h: 9, m: 0, p: 0, s: 0, c: 0, est: 'COMPLETADO' },
    { h: 9, m: 30, p: 2, s: 7, c: 4, est: 'COMPLETADO' },
    { h: 10, m: 0, p: 1, s: 3, c: 1, est: 'COMPLETADO' },
    { h: 10, m: 30, p: 0, s: 4, c: 8, est: 'CONFIRMADO' },
    { h: 11, m: 0, p: 3, s: 0, c: 5, est: 'CONFIRMADO' },
    { h: 12, m: 0, p: 2, s: 5, c: 6, est: 'PENDIENTE' },
    { h: 14, m: 0, p: 0, s: 1, c: 2, est: 'PENDIENTE' },
    { h: 15, m: 0, p: 1, s: 0, c: 9, est: 'PENDIENTE' },
    { h: 16, m: 0, p: 3, s: 3, c: 10, est: 'PENDIENTE' },
    { h: 17, m: 0, p: 2, s: 2, c: 11, est: 'PENDIENTE' },
  ];
  hoySlots.forEach((sl) => {
    addTurno(dayDate(0, sl.h, sl.m), sl.p, sl.s, sl.c, sl.est, sl.c % 2 === 0 ? 'WEB' : 'MANUAL');
  });

  // ── Proximos 7 dias ──
  for (let dAhead = 1; dAhead <= 7; dAhead++) {
    const slots = [
      [9, 0, 0, 0], [10, 30, 2, 2], [11, 0, 1, 3], [14, 0, 3, 0], [16, 0, 0, 5],
    ];
    slots.forEach(([h, m, pIdx, sIdx], j) => {
      const estado = j % 2 === 0 ? 'CONFIRMADO' : 'PENDIENTE';
      addTurno(dayDate(dAhead, h, m), pIdx, sIdx, (dAhead + j * 2) % 12, estado, j === 0 ? 'WEB' : 'MANUAL');
    });
  }

  // Insertar todos los turnos
  for (const t of turnos) {
    await prisma.turno.create({ data: t });
  }

  console.log(`Seed completado`);
  console.log(`  ${srvDefs.length} servicios`);
  console.log(`  ${profDefs.length} profesionales`);
  console.log(`  ${cliDefs.length} clientes`);
  console.log(`  ${turnos.length} turnos\n`);
  console.log('  Usuarios:');
  console.log('  - admin@demo.com     / demo1234  (SUPER_ADMIN)');
  console.log('  - roberto@demo.com   / demo1234  (ADMIN)\n');
  console.log(`  Reserva publica: /reservar/demo-salon`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
