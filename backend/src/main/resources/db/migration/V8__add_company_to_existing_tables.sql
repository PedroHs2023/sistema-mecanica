-- Insere empresa padrão para os dados de seed existentes
INSERT INTO companies (name, cnpj, active, created_at, updated_at)
VALUES ('Empresa Padrão', '00.000.000/0001-00', TRUE, NOW(), NOW());

-- Adiciona colunas como nullable primeiro
ALTER TABLE suppliers    ADD COLUMN company_id BIGINT NULL AFTER id;
ALTER TABLE parts        ADD COLUMN company_id BIGINT NULL AFTER id;
ALTER TABLE stock_movements ADD COLUMN company_id BIGINT NULL AFTER id;
ALTER TABLE purchases    ADD COLUMN company_id BIGINT NULL AFTER id;

-- Associa dados existentes à empresa padrão
UPDATE suppliers        SET company_id = 1;
UPDATE parts            SET company_id = 1;
UPDATE stock_movements  SET company_id = 1;
UPDATE purchases        SET company_id = 1;

-- Aplica NOT NULL e chaves estrangeiras
ALTER TABLE suppliers
    MODIFY COLUMN company_id BIGINT NOT NULL,
    ADD CONSTRAINT fk_suppliers_company FOREIGN KEY (company_id) REFERENCES companies(id);

ALTER TABLE parts
    MODIFY COLUMN company_id BIGINT NOT NULL,
    ADD CONSTRAINT fk_parts_company FOREIGN KEY (company_id) REFERENCES companies(id);

ALTER TABLE stock_movements
    MODIFY COLUMN company_id BIGINT NOT NULL,
    ADD CONSTRAINT fk_stock_movements_company FOREIGN KEY (company_id) REFERENCES companies(id);

ALTER TABLE purchases
    MODIFY COLUMN company_id BIGINT NOT NULL,
    ADD CONSTRAINT fk_purchases_company FOREIGN KEY (company_id) REFERENCES companies(id);
