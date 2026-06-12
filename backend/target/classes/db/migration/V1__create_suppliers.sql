CREATE TABLE suppliers (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    corporate_name  VARCHAR(200)  NOT NULL,
    trade_name      VARCHAR(200),
    document        VARCHAR(20)   NOT NULL UNIQUE,
    email           VARCHAR(150),
    phone           VARCHAR(30),
    delivery_days   INT,
    status          VARCHAR(20)   NOT NULL DEFAULT 'ATIVO',
    created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
