package com.garagepro.api.entity;

import com.garagepro.api.entity.enums.NfeAmbiente;
import com.garagepro.api.entity.enums.NfeStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "nfe")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Nfe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_order_id")
    private ServiceOrder serviceOrder;

    @Column(nullable = false)
    private Integer numero;

    @Column(nullable = false)
    private Integer serie;

    @Column(length = 44)
    private String chave;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private NfeStatus status = NfeStatus.PENDENTE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private NfeAmbiente ambiente = NfeAmbiente.HOMOLOGACAO;

    @Column(name = "natureza_operacao", nullable = false, length = 60)
    private String naturezaOperacao;

    @Column(name = "xml_enviado", columnDefinition = "LONGTEXT")
    private String xmlEnviado;

    @Column(name = "xml_retorno", columnDefinition = "LONGTEXT")
    private String xmlRetorno;

    @Column(length = 20)
    private String protocolo;

    @Column(name = "data_emissao", nullable = false)
    private LocalDateTime dataEmissao;

    @Column(name = "data_autorizacao")
    private LocalDateTime dataAutorizacao;

    @Column(name = "motivo_rejeicao", length = 500)
    private String motivoRejeicao;

    @Column(name = "dest_nome", length = 60)
    private String destNome;

    @Column(name = "dest_cpf_cnpj", length = 14)
    private String destCpfCnpj;

    @Column(name = "dest_ie", length = 18)
    private String destIe;

    @Column(name = "dest_email", length = 60)
    private String destEmail;

    @Column(name = "dest_logradouro", length = 60)
    private String destLogradouro;

    @Column(name = "dest_numero", length = 10)
    private String destNumero;

    @Column(name = "dest_bairro", length = 60)
    private String destBairro;

    @Column(name = "dest_municipio", length = 60)
    private String destMunicipio;

    @Column(name = "dest_uf", length = 2)
    private String destUf;

    @Column(name = "dest_cep", length = 8)
    private String destCep;

    @Column(name = "total_produtos", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal totalProdutos = BigDecimal.ZERO;

    @Column(name = "total_desconto", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal totalDesconto = BigDecimal.ZERO;

    @Column(name = "total_nfe", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal totalNfe = BigDecimal.ZERO;

    @Column(name = "forma_pagamento", length = 20)
    private String formaPagamento;

    @Column(name = "valor_pago", precision = 10, scale = 2)
    private BigDecimal valorPago;

    @OneToMany(mappedBy = "nfe", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<NfeItem> items = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
