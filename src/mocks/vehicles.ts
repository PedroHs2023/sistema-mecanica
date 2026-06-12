import type { Vehicle } from '../types'

export const mockVehicles: Vehicle[] = [
  {
    id: 'v1', plate: 'ABC-1D23', brand: 'Honda', model: 'Civic', year: 2018, color: 'Prata',
    fuel: 'FLEX', currentKm: 87500, customerId: 'c1', customerName: 'João Pereira',
    lastServiceDate: '2026-06-10', openServiceOrders: 2, status: 'EM_MANUTENCAO', nextRevisionKm: 90000,
  },
  {
    id: 'v2', plate: 'DEF-4E56', brand: 'Toyota', model: 'Corolla', year: 2020, color: 'Branco',
    fuel: 'FLEX', currentKm: 45200, customerId: 'c2', customerName: 'Maria Silva',
    lastServiceDate: '2026-06-09', openServiceOrders: 1, status: 'EM_MANUTENCAO', nextRevisionKm: 50000,
  },
  {
    id: 'v3', plate: 'GHI-7F89', brand: 'Volkswagen', model: 'Gol', year: 2016, color: 'Vermelho',
    fuel: 'FLEX', currentKm: 120800, customerId: 'c3', customerName: 'Transportes ABC Ltda',
    lastServiceDate: '2026-06-10', openServiceOrders: 1, status: 'EM_MANUTENCAO', nextRevisionKm: 130000,
  },
  {
    id: 'v4', plate: 'JKL-0G12', brand: 'Ford', model: 'Ka', year: 2019, color: 'Preto',
    fuel: 'FLEX', currentKm: 63000, customerId: 'c4', customerName: 'Pedro Alves',
    lastServiceDate: '2026-06-08', openServiceOrders: 1, status: 'EM_MANUTENCAO', nextRevisionKm: 70000,
  },
  {
    id: 'v5', plate: 'MNO-3H45', brand: 'Chevrolet', model: 'Onix', year: 2021, color: 'Cinza',
    fuel: 'FLEX', currentKm: 31500, customerId: 'c5', customerName: 'Ana Rodrigues',
    lastServiceDate: '2026-06-13', openServiceOrders: 1, status: 'EM_MANUTENCAO', nextRevisionKm: 35000,
  },
  {
    id: 'v6', plate: 'PQR-6I78', brand: 'Hyundai', model: 'HB20', year: 2022, color: 'Azul',
    fuel: 'FLEX', currentKm: 18200, customerId: 'c6', customerName: 'Distribuidora XYZ',
    lastServiceDate: '2026-06-09', openServiceOrders: 1, status: 'EM_MANUTENCAO', nextRevisionKm: 20000,
  },
  {
    id: 'v7', plate: 'STU-9J01', brand: 'Fiat', model: 'Argo', year: 2023, color: 'Branco',
    fuel: 'FLEX', currentKm: 8500, customerId: 'c1', customerName: 'João Pereira',
    openServiceOrders: 0, status: 'SEM_OS', nextRevisionKm: 10000,
  },
  {
    id: 'v8', plate: 'VWX-2K34', brand: 'Renault', model: 'Kwid', year: 2020, color: 'Laranja',
    fuel: 'GASOLINA', currentKm: 55000, customerId: 'c6', customerName: 'Distribuidora XYZ',
    lastServiceDate: '2026-06-09', openServiceOrders: 1, status: 'EM_MANUTENCAO', nextRevisionKm: 60000,
  },
  {
    id: 'v9', plate: 'YZA-3L56', brand: 'Ford', model: 'Transit', year: 2019, color: 'Branco',
    fuel: 'DIESEL', currentKm: 142000, customerId: 'c8', customerName: 'Construtora MNP Ltda',
    lastServiceDate: '2026-04-20', openServiceOrders: 0, status: 'ATIVO', nextRevisionKm: 150000,
  },
  {
    id: 'v10', plate: 'BCD-5M78', brand: 'Fiat', model: 'Ducato', year: 2020, color: 'Branco',
    fuel: 'DIESEL', currentKm: 88000, customerId: 'c8', customerName: 'Construtora MNP Ltda',
    lastServiceDate: '2026-04-15', openServiceOrders: 0, status: 'ATIVO', nextRevisionKm: 100000,
  },
  {
    id: 'v11', plate: 'EFG-8N90', brand: 'Jeep', model: 'Renegade', year: 2022, color: 'Prata',
    fuel: 'FLEX', currentKm: 22000, customerId: 'c9', customerName: 'Fernanda Lima',
    lastServiceDate: '2026-05-30', openServiceOrders: 0, status: 'ATIVO', nextRevisionKm: 30000,
  },
  {
    id: 'v12', plate: 'HIJ-1O23', brand: 'Volkswagen', model: 'Amarok', year: 2018, color: 'Prata',
    fuel: 'DIESEL', currentKm: 165000, customerId: 'c8', customerName: 'Construtora MNP Ltda',
    lastServiceDate: '2026-04-10', openServiceOrders: 0, status: 'ATIVO', nextRevisionKm: 170000,
  },
]
