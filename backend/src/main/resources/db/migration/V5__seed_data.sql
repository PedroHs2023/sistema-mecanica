-- Fornecedores
INSERT INTO suppliers (corporate_name, trade_name, document, email, phone, delivery_days, status) VALUES
('Distribuidora Omega Peças Ltda',      'Omega Peças',      '12.345.678/0001-90', 'vendas@omegapecas.com.br',   '(11) 4002-8922', 3, 'ATIVO'),
('Auto Parts Brasil S.A.',              'Auto Parts',       '23.456.789/0001-01', 'pedidos@autoparts.com.br',   '(11) 3030-4050', 5, 'ATIVO'),
('Filtros e Lubrificantes Nacional Ltda','FLN Distribuidora','34.567.890/0001-12', 'contato@flndist.com.br',     '(21) 2020-3030', 4, 'ATIVO'),
('Baterias Sul Ltda',                   'Baterias Sul',     '45.678.901/0001-23', 'vendas@bateriassul.com.br',  '(51) 3333-4444', 7, 'ATIVO'),
('Importadora TechCar Ltda',            'TechCar',          '56.789.012/0001-34', 'import@techcar.com.br',      '(11) 5555-6666', 10,'ATIVO');

-- Peças (estoque inicial)
INSERT INTO parts (internal_code, description, manufacturer_code, current_stock, minimum_stock, average_cost, sale_price, unit, category, ncm, supplier_id, status) VALUES
('P001', 'Óleo Motor 5W30 Sintético 1L',          'MOT-5W30-1L',  48,  20, 22.50,  38.90, 'UN', 'Lubrificantes',  '2710.19.31', 1, 'NORMAL'),
('P002', 'Filtro de Óleo Tecfil PSL55',           'TEC-PSL55',     3,  10, 12.80,  24.90, 'UN', 'Filtros',        '8421.23.00', 1, 'BAIXO'),
('P003', 'Pastilha de Freio Dianteira Cobreq',    'COB-FD-220',   18,   8, 42.00,  79.90, 'JG', 'Freios',         '8708.30.11', 2, 'NORMAL'),
('P004', 'Vela de Ignição NGK BKR5E',             'NGK-BKR5E',    24,  12,  8.90,  16.50, 'UN', 'Ignição',        '8511.10.00', 2, 'NORMAL'),
('P005', 'Bateria 60Ah Moura M60GE',              'MOU-M60GE',     5,   3, 380.00, 590.00,'UN', 'Baterias',       '8507.10.00', 4, 'NORMAL'),
('P006', 'Correia Dentada Kit Dayco',             'DAY-KIT-401',   8,   5, 89.00, 159.90, 'KT', 'Correia',        '4010.39.90', 3, 'NORMAL'),
('P007', 'Filtro de Ar Mann C25007',              'MAN-C25007',   12,   8, 18.50,  34.90, 'UN', 'Filtros',        '8421.31.00', 3, 'NORMAL'),
('P008', 'Fluido de Freio DOT4 500ml',            'GIR-DOT4-500',  6,   5, 15.00,  27.90, 'UN', 'Lubrificantes',  '3819.00.00', 1, 'NORMAL'),
('P009', 'Amortecedor Dianteiro Cofap',           'COF-AD-101',    2,   4, 198.00, 349.00,'UN', 'Suspensão',      '8708.80.10', 2, 'BAIXO'),
('P010', 'Kit Embreagem LUK 3 Peças',             'LUK-EM-301',    4,   2, 420.00, 699.00,'KT', 'Embreagem',      '8708.93.00', 2, 'NORMAL'),
('P011', 'Disco de Freio Dianteiro Brembo',       'BRE-DF-450',   10,   4, 145.00, 249.00,'UN', 'Freios',         '8708.30.19', 2, 'NORMAL'),
('P012', 'Palheta Limpador Bosch Aerotwin 22"',   'BOS-AE-55',    16,   6, 28.00,  49.90, 'UN', 'Palhetas',       '8527.99.90', 3, 'NORMAL');

-- Movimentações iniciais (entrada de compra)
INSERT INTO stock_movements (part_id, type, quantity, unit_cost, supplier_name, user_name, reason, created_at) VALUES
(1,  'ENTRADA_COMPRA',  50, 22.50, 'Omega Peças', 'Admin', 'Compra inicial', '2026-05-10 09:00:00'),
(2,  'ENTRADA_COMPRA',  20, 12.80, 'Omega Peças', 'Admin', 'Compra inicial', '2026-05-10 09:00:00'),
(3,  'ENTRADA_COMPRA',  20, 42.00, 'Auto Parts',  'Admin', 'Compra inicial', '2026-05-10 09:00:00'),
(4,  'ENTRADA_COMPRA',  30,  8.90, 'Auto Parts',  'Admin', 'Compra inicial', '2026-05-10 09:00:00'),
(5,  'ENTRADA_COMPRA',   5, 380.00,'Baterias Sul', 'Admin', 'Compra inicial', '2026-05-10 09:00:00'),
(6,  'ENTRADA_COMPRA',  10, 89.00, 'FLN Distribuidora', 'Admin', 'Compra inicial', '2026-05-10 09:00:00'),
(7,  'ENTRADA_COMPRA',  15, 18.50, 'FLN Distribuidora', 'Admin', 'Compra inicial', '2026-05-10 09:00:00'),
(8,  'ENTRADA_COMPRA',  10, 15.00, 'Omega Peças', 'Admin', 'Compra inicial', '2026-05-10 09:00:00'),
(9,  'ENTRADA_COMPRA',   5, 198.00,'Auto Parts',  'Admin', 'Compra inicial', '2026-05-10 09:00:00'),
(10, 'ENTRADA_COMPRA',   5, 420.00,'Auto Parts',  'Admin', 'Compra inicial', '2026-05-10 09:00:00'),
(11, 'ENTRADA_COMPRA',  12, 145.00,'Auto Parts',  'Admin', 'Compra inicial', '2026-05-10 09:00:00'),
(12, 'ENTRADA_COMPRA',  20, 28.00, 'FLN Distribuidora', 'Admin', 'Compra inicial', '2026-05-10 09:00:00'),
-- Saídas por OS
(1,  'SAIDA_OS',  2, 22.50, NULL, 'Carlos Mecânico', 'OS #0045', '2026-06-02 10:30:00'),
(4,  'SAIDA_OS',  4,  8.90, NULL, 'Carlos Mecânico', 'OS #0046', '2026-06-02 11:00:00'),
(3,  'SAIDA_OS',  2, 42.00, NULL, 'Ana Lima',        'OS #0047', '2026-06-03 14:00:00'),
(2,  'SAIDA_OS', 17, 12.80, NULL, 'Carlos Mecânico', 'OS #0048', '2026-06-04 09:00:00'),
(9,  'SAIDA_OS',  3, 198.00,NULL, 'Paulo Santos',    'OS #0049', '2026-06-05 10:00:00');
