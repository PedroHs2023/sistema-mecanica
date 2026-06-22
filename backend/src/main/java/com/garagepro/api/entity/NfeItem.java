package com.garagepro.api.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "nfe_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NfeItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nfe_id", nullable = false)
    private Nfe nfe;

    @Column(name = "numero_item", nullable = false)
    private Integer numeroItem;

    @Column(name = "codigo_produto", length = 60)
    private String codigoProduto;

    @Column(nullable = false, length = 120)
    private String descricao;

    @Column(length = 8)
    private String ncm;

    @Column(nullable = false, length = 4)
    private String cfop;

    @Column(nullable = false, length = 6)
    private String unidade;

    @Column(nullable = false, precision = 11, scale = 4)
    private BigDecimal quantidade;

    @Column(name = "valor_unitario", nullable = false, precision = 11, scale = 4)
    private BigDecimal valorUnitario;

    @Column(name = "valor_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorTotal;

    @Column(length = 3)
    private String csosn;

    @Column(name = "icms_aliquota", precision = 5, scale = 2)
    private BigDecimal icmsAliquota;

    @Column(name = "icms_valor", precision = 10, scale = 2)
    private BigDecimal icmsValor;

    @Column(name = "pis_cst", length = 2)
    private String pisCst;

    @Column(name = "pis_valor", precision = 10, scale = 2)
    private BigDecimal pisValor;

    @Column(name = "cofins_cst", length = 2)
    private String cofinsCst;

    @Column(name = "cofins_valor", precision = 10, scale = 2)
    private BigDecimal cofinsValor;
}
