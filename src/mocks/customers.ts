import type { Customer } from '../types'

export const mockCustomers: Customer[] = [
  {
    id: 'c1', type: 'PF', name: 'João Pereira',
    document: '123.456.789-00', phone: '(11) 98765-4321', whatsapp: '(11) 98765-4321',
    email: 'joao.pereira@email.com', city: 'São Paulo', state: 'SP',
    vehiclesCount: 2, openOrdersCount: 2, lastServiceDate: '2026-06-10', status: 'ATIVO',
  },
  {
    id: 'c2', type: 'PF', name: 'Maria Silva',
    document: '987.654.321-00', phone: '(11) 91234-5678',
    email: 'maria.silva@email.com', city: 'São Paulo', state: 'SP',
    vehiclesCount: 1, openOrdersCount: 1, lastServiceDate: '2026-06-09', status: 'ATIVO',
  },
  {
    id: 'c3', type: 'PJ', name: 'Transportes ABC Ltda',
    document: '12.345.678/0001-90', phone: '(11) 3333-4444', whatsapp: '(11) 3333-4444',
    email: 'frota@transportesabc.com.br', city: 'Guarulhos', state: 'SP',
    vehiclesCount: 1, openOrdersCount: 1, lastServiceDate: '2026-06-10', status: 'ATIVO',
  },
  {
    id: 'c4', type: 'PF', name: 'Pedro Alves',
    document: '456.789.123-00', phone: '(11) 94567-8901', whatsapp: '(11) 94567-8901',
    city: 'São Paulo', state: 'SP',
    vehiclesCount: 1, openOrdersCount: 1, lastServiceDate: '2026-06-08', status: 'ATIVO',
  },
  {
    id: 'c5', type: 'PF', name: 'Ana Rodrigues',
    document: '789.123.456-00', phone: '(11) 97890-1234',
    email: 'ana.rodrigues@email.com', city: 'Osasco', state: 'SP',
    vehiclesCount: 1, openOrdersCount: 1, lastServiceDate: '2026-06-13', status: 'ATIVO',
  },
  {
    id: 'c6', type: 'PJ', name: 'Distribuidora XYZ',
    document: '98.765.432/0001-10', phone: '(11) 2222-3333',
    email: 'manutencao@xyz.com.br', city: 'São Bernardo do Campo', state: 'SP',
    vehiclesCount: 2, openOrdersCount: 2, lastServiceDate: '2026-06-09', status: 'ATIVO',
  },
  {
    id: 'c7', type: 'PF', name: 'Roberto Santos',
    document: '321.654.987-00', phone: '(11) 95556-7890',
    city: 'Mauá', state: 'SP',
    vehiclesCount: 0, openOrdersCount: 0, status: 'INATIVO',
  },
  {
    id: 'c8', type: 'PJ', name: 'Construtora MNP Ltda',
    document: '55.444.333/0001-22', phone: '(11) 4444-5555', whatsapp: '(11) 94444-5555',
    email: 'frotas@construtoramanp.com.br', city: 'Santo André', state: 'SP',
    vehiclesCount: 3, openOrdersCount: 0, lastServiceDate: '2026-04-20', status: 'ATIVO',
  },
  {
    id: 'c9', type: 'PF', name: 'Fernanda Lima',
    document: '654.321.098-77', phone: '(11) 96677-8899', whatsapp: '(11) 96677-8899',
    email: 'fernanda.lima@email.com', city: 'Diadema', state: 'SP',
    vehiclesCount: 1, openOrdersCount: 0, lastServiceDate: '2026-05-30', status: 'ATIVO',
  },
]
