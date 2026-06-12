CREATE TABLE purchases (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    number           VARCHAR(50)    NOT NULL UNIQUE,
    supplier_id      BIGINT         NOT NULL,
    date             DATE           NOT NULL,
    total_items      INT            NOT NULL DEFAULT 0,
    total_value      DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
    status           VARCHAR(50)    NOT NULL DEFAULT 'RASCUNHO',
    xml_attached     BOOLEAN        NOT NULL DEFAULT FALSE,
    responsible_user VARCHAR(100),
    notes            TEXT,
    received_at      TIMESTAMP,
    created_at       TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_purchases_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE purchase_items (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    purchase_id   BIGINT         NOT NULL,
    part_id       BIGINT,
    internal_code VARCHAR(50)    NOT NULL,
    description   VARCHAR(300)   NOT NULL,
    quantity      INT            NOT NULL,
    unit_cost     DECIMAL(10,2)  NOT NULL,
    total         DECIMAL(12,2)  NOT NULL,
    is_new        BOOLEAN        NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_pitems_purchase FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE,
    CONSTRAINT fk_pitems_part     FOREIGN KEY (part_id)     REFERENCES parts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE import_history (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    type          VARCHAR(20)    NOT NULL,
    file_name     VARCHAR(300)   NOT NULL,
    items_found   INT            NOT NULL DEFAULT 0,
    created_count INT            NOT NULL DEFAULT 0,
    updated_count INT            NOT NULL DEFAULT 0,
    ignored_count INT            NOT NULL DEFAULT 0,
    status        VARCHAR(30)    NOT NULL DEFAULT 'PROCESSADA',
    imported_at   TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
