package com.garagepro.api.dto.nfe;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record NfeItemRequest(
    String codigoProduto,
    @NotBlank String descricao,
    String ncm,
    @NotBlank String cfop,
    @NotBlank String unidade,
    @NotNull BigDecimal quantidade,
    @NotNull BigDecimal valorUnitario,
    String csosn
) {}
