const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding...');

  // ── Negocio ──────────────────────────────────────────────────────────────
  const negocio = await prisma.negocio.upsert({
    where: { slug: 'demo-salon' },
    update: {},
    create: {
      nombre: 'Salón Demo',
      email: 'salon@demo.com',
      telefono: '+54 11 1234-5678',
      slug: 'demo-salon',
      descripcion: 'Salón de belleza y estética — cuenta de demostración',
      direccion: 'Av. Corrientes 1234, Buenos Aires',
    },
  });

  // ── Usuario admin ─────────────────────────────────────────────────────────
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

  // ── Servicios ─────────────────────────────────────────────────────────────
  const [corte, color, manicuria, barba] = await Promise.all([
    prisma.servicio.upsert({
      where: { id: 'seed-srv-corte' },
      update: {},
      create: { id: 'seed-srv-corte', negocio_id: negocio.id, nombre: 'Corte de cabello', duracion_min: 30, precio: 3500, color: '#3b82f6' },
    }),
    prisma.servicio.upsert({
      where: { id: 'seed-srv-color' },
      update: {},
      create: { id: 'seed-srv-color', negocio_id: negocio.id, nombre: 'Coloración', duracion_min: 90, precio: 12000, color: '#f59e0b' },
    }),
    prisma.servicio.upsert({
      where: { id: 'seed-srv-mani' },
      update: {},
      create: { id: 'seed-srv-mani', negocio_id: negocio.id, nombre: 'Manicuria', duracion_min: 45, precio: 4500, color: '#ec4899' },
    }),
    prisma.servicio.upsert({
      where: { id: 'seed-srv-barba' },
      update: {},
      create: { id: 'seed-srv-barba', negocio_id: negocio.id, nombre: 'Arreglo de barba', duracion_min: 20, precio: 2500, color: '#10b981' },
    }),
  ]);

  // ── Profesionales ─────────────────────────────────────────────────────────
  const [lucia, martin] = await Promise.all([
    prisma.profesional.upsert({
      where: { id: 'seed-prof-lucia' },
      update: {},
      create: { id: 'seed-prof-lucia', negocio_id: negocio.id, nombre: 'Lucía Gómez', especialidad: 'Colorista' },
    }),
    prisma.profesional.upsert({
      where: { id: 'seed-prof-martin' },
      update: {},
      create: { id: 'seed-prof-martin', negocio_id: negocio.id, nombre: 'Martín López', especialidad: 'Barbero' },
    }),
  ]);

  // ── Horarios (lun-sab 9-18) ───────────────────────────────────────────────
  const dias = [1, 2, 3, 4, 5, 6]; // lunes a sábado
  for (const prof of [lucia, martin]) {
    for (const dia of dias) {
      await prisma.horarioDisponible.upsert({
        where: { id: `seed-horario-${prof.id}-${dia}` },
        update: {},
        create: {
          id: `seed-horario-${prof.id}-${dia}`,
          profesional_id: prof.id,
          dia_semana: dia,
          hora_inicio: '09:00',
          hora_fin: '18:00',
        },
      });
    }
  }

  // ── Clientes ──────────────────────────────────────────────────────────────
  const [sofia, carlos, valentina] = await Promise.all([
    prisma.cliente.upsert({
      where: { id: 'seed-cli-sofia' },
      update: {},
      create: { id: 'seed-cli-sofia', negocio_id: negocio.id, nombre: 'Sofía Ramírez', email: 'sofia@mail.com', telefono: '11 2233-4455' },
    }),
    prisma.cliente.upsert({
      where: { id: 'seed-cli-carlos' },
      update: {},
      create: { id: 'seed-cli-carlos', negocio_id: negocio.id, nombre: 'Carlos Méndez', telefono: '11 5566-7788' },
    }),
    prisma.cliente.upsert({
      where: { id: 'seed-cli-valentina' },
      update: {},
      create: { id: 'seed-cli-valentina', negocio_id: negocio.id, nombre: 'Valentina Torres', email: 'valen@mail.com' },
    }),
  ]);

  // ── Turnos de hoy ─────────────────────────────────────────────────────────
  const hoy = new Date();
  const fecha = (h, m) => { const d = new Date(hoy); d.setHours(h, m, 0, 0); return d; };

  const turnosDef = [
    { id: 'seed-turno-1', profesional: lucia, servicio: corte,    cliente: sofia,     inicio: fecha(9, 0),  estado: 'COMPLETADO' },
    { id: 'seed-turno-2', profesional: lucia, servicio: color,    cliente: valentina, inicio: fecha(10, 0), estado: 'CONFIRMADO' },
    { id: 'seed-turno-3', profesional: martin, servicio: barba,   cliente: carlos,    inicio: fecha(11, 0), estado: 'PENDIENTE'  },
    { id: 'seed-turno-4', profesional: lucia, servicio: manicuria, cliente: sofia,    inicio: fecha(14, 0), estado: 'PENDIENTE'  },
    { id: 'seed-turno-5', profesional: martin, servicio: corte,   cliente: valentina, inicio: fecha(15, 0), estado: 'PENDIENTE'  },
  ];

  for (const t of turnosDef) {
    const fin = new Date(t.inicio.getTime() + t.servicio.duracion_min * 60_000);
    await prisma.turno.upsert({
      where: { id: t.id },
      update: {},
      create: {
        id: t.id,
        negocio_id: negocio.id,
        profesional_id: t.profesional.id,
        servicio_id: t.servicio.id,
        cliente_id: t.cliente.id,
        fecha_hora_inicio: t.inicio,
        fecha_hora_fin: fin,
        estado: t.estado,
      },
    });
  }

  console.log('✓ Seed completado');
  console.log('  Email:    admin@demo.com');
  console.log('  Password: demo1234');
  console.log(`  Reserva pública: /reservar/demo-salon`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
