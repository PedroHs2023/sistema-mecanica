import type { ScheduleAppointment } from '../types'

export const mockSchedule: ScheduleAppointment[] = [
  // ── Monday 2026-06-08 ────────────────────────────────────────────────────────
  {
    id: 'apt1',
    customerId: 'c1', customerName: 'João Pereira', customerPhone: '(11) 98765-4321',
    vehicleId: 'v1', vehicle: 'Honda Civic 2018', plate: 'ABC-1D23',
    date: '2026-06-08', time: '09:00', duration: 90,
    type: 'REVISAO', status: 'REALIZADO',
    mechanicId: 'm1', mechanicName: 'Carlos Souza',
    description: 'Revisão dos 87.000 km — troca de óleo e filtros.',
  },
  {
    id: 'apt2',
    customerId: 'c4', customerName: 'Pedro Alves', customerPhone: '(11) 94567-8901',
    vehicleId: 'v4', vehicle: 'Ford Ka 2019', plate: 'JKL-0G12',
    date: '2026-06-08', time: '14:00', duration: 60,
    type: 'REPARO', status: 'REALIZADO',
    mechanicId: 'm2', mechanicName: 'Lucas Santos',
    description: 'Reparo do sistema de freios — barulho ao frear.',
  },

  // ── Tuesday 2026-06-09 ───────────────────────────────────────────────────────
  {
    id: 'apt3',
    customerId: 'c2', customerName: 'Maria Silva', customerPhone: '(11) 91234-5678',
    vehicleId: 'v2', vehicle: 'Toyota Corolla 2020', plate: 'DEF-4E56',
    date: '2026-06-09', time: '08:30', duration: 120,
    type: 'REVISAO', status: 'REALIZADO',
    mechanicId: 'm1', mechanicName: 'Carlos Souza',
    description: 'Revisão periódica dos 45.000 km.',
  },
  {
    id: 'apt4',
    customerId: 'c6', customerName: 'Distribuidora XYZ', customerPhone: '(11) 2222-3333',
    vehicleId: 'v6', vehicle: 'Hyundai HB20 2022', plate: 'PQR-6I78',
    date: '2026-06-09', time: '10:00', duration: 60,
    type: 'REPARO', status: 'REALIZADO',
    mechanicId: 'm3', mechanicName: 'Roberto Jr.',
    description: 'Substituição de lâmpada de farol.',
  },
  {
    id: 'apt5',
    customerId: 'c9', customerName: 'Fernanda Lima', customerPhone: '(11) 96677-8899',
    vehicleId: 'v11', vehicle: 'Jeep Renegade 2022', plate: 'EFG-8N90',
    date: '2026-06-09', time: '16:00', duration: 45,
    type: 'ORCAMENTO', status: 'REALIZADO',
    description: 'Orçamento para troca de pneus.',
  },

  // ── Wednesday 2026-06-10 (today) ─────────────────────────────────────────────
  {
    id: 'apt6',
    customerId: 'c5', customerName: 'Ana Rodrigues', customerPhone: '(11) 97890-1234',
    vehicleId: 'v5', vehicle: 'Chevrolet Onix 2021', plate: 'MNO-3H45',
    date: '2026-06-10', time: '09:00', duration: 90,
    type: 'REVISAO', status: 'CONFIRMADO',
    mechanicId: 'm1', mechanicName: 'Carlos Souza',
    description: 'Revisão 30.000 km — óleo, filtros e alinhamento.',
  },
  {
    id: 'apt7',
    customerId: 'c3', customerName: 'Transportes ABC Ltda', customerPhone: '(11) 3333-4444',
    vehicleId: 'v3', vehicle: 'Volkswagen Gol 2016', plate: 'GHI-7F89',
    date: '2026-06-10', time: '11:00', duration: 120,
    type: 'REPARO', status: 'CONFIRMADO',
    mechanicId: 'm2', mechanicName: 'Lucas Santos',
    description: 'Troca de correia dentada e tensor.',
  },
  {
    id: 'apt8',
    customerId: 'c1', customerName: 'João Pereira', customerPhone: '(11) 98765-4321',
    vehicleId: 'v1', vehicle: 'Honda Civic 2018', plate: 'ABC-1D23',
    date: '2026-06-10', time: '14:30', duration: 30,
    type: 'RETORNO_GARANTIA', status: 'AGENDADO',
    description: 'Retorno para verificar ruído identificado na revisão.',
  },
  {
    id: 'apt9',
    customerId: 'c8', customerName: 'Construtora MNP Ltda', customerPhone: '(11) 4444-5555',
    vehicleId: 'v9', vehicle: 'Ford Transit 2019', plate: 'YZA-3L56',
    date: '2026-06-10', time: '16:00', duration: 120,
    type: 'REPARO', status: 'AGENDADO',
    mechanicId: 'm3', mechanicName: 'Roberto Jr.',
    description: 'Manutenção preventiva — 142.000 km.',
  },

  // ── Thursday 2026-06-11 ──────────────────────────────────────────────────────
  {
    id: 'apt10',
    customerId: 'c2', customerName: 'Maria Silva', customerPhone: '(11) 91234-5678',
    vehicleId: 'v2', vehicle: 'Toyota Corolla 2020', plate: 'DEF-4E56',
    date: '2026-06-11', time: '08:00', duration: 60,
    type: 'REVISAO', status: 'AGENDADO',
    mechanicId: 'm1', mechanicName: 'Carlos Souza',
    description: 'Revisão complementar após conserto.',
  },
  {
    id: 'apt11',
    customerId: 'c4', customerName: 'Pedro Alves', customerPhone: '(11) 94567-8901',
    vehicleId: 'v4', vehicle: 'Ford Ka 2019', plate: 'JKL-0G12',
    date: '2026-06-11', time: '10:30', duration: 45,
    type: 'ORCAMENTO', status: 'AGENDADO',
    description: 'Orçamento para instalação de central multimídia.',
  },
  {
    id: 'apt12',
    customerId: 'c9', customerName: 'Fernanda Lima', customerPhone: '(11) 96677-8899',
    vehicleId: 'v11', vehicle: 'Jeep Renegade 2022', plate: 'EFG-8N90',
    date: '2026-06-11', time: '15:00', duration: 60,
    type: 'RETORNO_GARANTIA', status: 'AGENDADO',
    mechanicId: 'm2', mechanicName: 'Lucas Santos',
    description: 'Retorno de garantia — verificação do amortecedor.',
  },

  // ── Friday 2026-06-12 ────────────────────────────────────────────────────────
  {
    id: 'apt13',
    customerId: 'c5', customerName: 'Ana Rodrigues', customerPhone: '(11) 97890-1234',
    vehicleId: 'v5', vehicle: 'Chevrolet Onix 2021', plate: 'MNO-3H45',
    date: '2026-06-12', time: '09:30', duration: 90,
    type: 'REPARO', status: 'AGENDADO',
    mechanicId: 'm1', mechanicName: 'Carlos Souza',
    description: 'Reparo no ar condicionado — não refresca.',
  },
  {
    id: 'apt14',
    customerId: 'c8', customerName: 'Construtora MNP Ltda', customerPhone: '(11) 4444-5555',
    vehicleId: 'v10', vehicle: 'Fiat Ducato 2020', plate: 'BCD-5M78',
    date: '2026-06-12', time: '11:00', duration: 120,
    type: 'REVISAO', status: 'AGENDADO',
    mechanicId: 'm3', mechanicName: 'Roberto Jr.',
    description: 'Revisão 88.000 km — troca de óleo e filtros.',
  },
  {
    id: 'apt15',
    customerId: 'c1', customerName: 'João Pereira', customerPhone: '(11) 98765-4321',
    vehicleId: 'v7', vehicle: 'Fiat Argo 2023', plate: 'STU-9J01',
    date: '2026-06-12', time: '14:00', duration: 60,
    type: 'REPARO', status: 'AGENDADO',
    mechanicId: 'm2', mechanicName: 'Lucas Santos',
    description: 'Vibração no volante em alta velocidade.',
  },

  // ── Saturday 2026-06-13 ──────────────────────────────────────────────────────
  {
    id: 'apt16',
    customerId: 'c5', customerName: 'Ana Rodrigues', customerPhone: '(11) 97890-1234',
    vehicleId: 'v5', vehicle: 'Chevrolet Onix 2021', plate: 'MNO-3H45',
    date: '2026-06-13', time: '09:00', duration: 30,
    type: 'REVISAO', status: 'CONFIRMADO',
    mechanicId: 'm1', mechanicName: 'Carlos Souza',
    description: 'Check-up rápido após reparo do ar condicionado.',
  },
  {
    id: 'apt17',
    customerId: 'c6', customerName: 'Distribuidora XYZ', customerPhone: '(11) 2222-3333',
    vehicleId: 'v8', vehicle: 'Renault Kwid 2020', plate: 'VWX-2K34',
    date: '2026-06-13', time: '10:00', duration: 45,
    type: 'ORCAMENTO', status: 'AGENDADO',
    description: 'Orçamento para revisão completa.',
  },
]
