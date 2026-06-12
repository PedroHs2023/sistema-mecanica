CREATE TABLE stock_movements (
    id                          BIGINT AUTO_INCREMENT PRIMARY KEY,
    part_id                     BIGINT        NOT NULL,
    type                        VARCHAR(50)   NOT NULL,
    quantity                    INT           NOT NULL,
    unit_cost                   DECIMAL(10,2),
    related_service_order_number VARCHAR(50),
    supplier_name               VARCHAR(200),
    user_name                   VARCHAR(100)  NOT NULL,
    reason                      VARCHAR(500),
    created_at                  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_movements_part FOREIGN KEY (part_id) REFERENCES parts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
