package com.garagepro.api.dto.nfe;

import com.garagepro.api.entity.enums.NfeAmbiente;
import com.garagepro.api.entity.enums.NfeStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record NfeResponse(
    Long id,
    Integer numero,
    Integer serie,
    String chave,
    NfeStatus status,
    NfeAmbiente ambiente,
    String naturezaOperacao,
    String protocolo,
    String destNome,
    String destCpfCnpj,
    BigDecimal totalProdutos,
    BigDecimal totalDesconto,
    BigDecimal totalNfe,
    LocalDateTime dataEmissao,
    LocalDateTime dataAutorizacao,
    String motivoRejeicao,
    List<NfeItemResponse> items
) {}
