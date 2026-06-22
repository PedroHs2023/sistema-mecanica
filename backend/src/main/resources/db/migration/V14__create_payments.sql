ALTER TABLE service_orders
ADD COLUMN payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE';

CREATE TABLE payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    service_order_id BIGINT NOT NULL,
    company_id BIGINT NOT NULL,
    payment_method VARCHAR(30) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    paid_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes VARCHAR(500),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_payments_service_order FOREIGN KEY (service_order_id) REFERENCES service_orders(id),
    CONSTRAINT fk_payments_company FOREIGN KEY (company_id) REFERENCES companies(id)
);