package com.garagepro.api.dto.nfe;

import java.math.BigDecimal;

public record NfeItemResponse(
    Long id,
    Integer numeroItem,
    String codigoProduto,
    String descricao,
    String ncm,
    String cfop,
    String unidade,
    BigDecimal quantidade,
    BigDecimal valorUnitario,
    BigDecimal valorTotal,
    String csosn
) {}
