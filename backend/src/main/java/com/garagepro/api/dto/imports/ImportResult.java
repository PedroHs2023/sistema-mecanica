package com.garagepro.api.dto.imports;

public record ImportResult(
    int itemsFound,
    int created,
    int updated,
    int ignored,
    String status,
    String message
) {}
