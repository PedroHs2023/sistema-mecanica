package com.garagepro.api.dto.nfe;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record NfeRequest(
    Long serviceOrderId,
    @NotBlank String naturezaOperacao,
    @NotBlank String destNome,
    @NotBlank String destCpfCnpj,
    String destIe,
    String destEmail,
    @NotBlank String destLogradouro,
    @NotBlank String destNumero,
    @NotBlank String destBairro,
    @NotBlank String destMunicipio,
    @NotBlank String destUf,
    @NotBlank String destCep,
    @NotNull List<NfeItemRequest> items
) {}
