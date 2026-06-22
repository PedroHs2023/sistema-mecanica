package com.garagepro.api.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "companies")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder


public class Company {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, unique = true,length = 18)
    private String cnpj;

    @Column(length = 20)
    private String phone;

    @Column(length = 150)
    private String email;

    @Column(length = 255)
    private String address;

    @Column(length = 100)
    private String city;

    @Column(length = 2)
    private String state;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;
    
    @Column(length = 20)
    private String ie;

    @Column(length = 20)
    private String im;

    @Column(length = 10)
    private String cnae;

    @Column(nullable = false)
    @Builder.Default
    private Integer crt = 1;

    @Column(length = 2)
    private String uf;

    @Column(name = "nfe_serie")
    @Builder.Default
    private Integer nfeSerie = 1;

    @Column(name = "nfe_ultimo_numero")
    @Builder.Default
    private Integer nfeUltimoNumero = 0;

    @Column(name = "nfe_ambiente")
    @Builder.Default
    private Integer nfeAmbiente = 2;

    @Column(name = "certificate", columnDefinition = "LONGBLOB")
    private byte[] certificate;

    @Column(name = "certificate_password", length = 255)
    private String certificatePassword;

    @Column(name = "certificate_expiry")
    private LocalDateTime certificateExpiry;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

}
