package com.garagepro.api.parser;

import com.garagepro.api.dto.imports.SpreadsheetImportPreviewResponse;
import com.garagepro.api.dto.imports.SpreadsheetItemPreview;
import com.opencsv.CSVParserBuilder;
import com.opencsv.CSVReaderBuilder;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Component
public class SpreadsheetParser {

    // Expected columns: Descrição, Código, Cód.Fabricante, Estoque, Custo, Preço, Fornecedor, NCM

    public SpreadsheetImportPreviewResponse parseXlsx(InputStream stream, String fileName) throws Exception {
        List<SpreadsheetItemPreview> items = new ArrayList<>();

        try (Workbook wb = new XSSFWorkbook(stream)) {
            Sheet sheet = wb.getSheetAt(0);
            Row header  = sheet.getRow(0);
            if (header == null) throw new IllegalArgumentException("Planilha vazia ou sem cabeçalho.");

            for (int r = 1; r <= sheet.getLastRowNum(); r++) {
                Row row = sheet.getRow(r);
                if (row == null) continue;

                String description     = cellStr(row, 0);
                String internalCode    = cellStr(row, 1);
                String manufacturerCode = cellStr(row, 2);
                Integer stock          = cellInt(row, 3);
                BigDecimal cost        = cellBD(row, 4);
                BigDecimal price       = cellBD(row, 5);
                String supplierName    = cellStr(row, 6);
                String ncm             = cellStr(row, 7);

                items.add(classify(description, internalCode, manufacturerCode,
                    stock, cost, price, supplierName, ncm));
            }
        }

        return buildResponse(fileName, items);
    }

    public SpreadsheetImportPreviewResponse parseCsv(InputStream stream, String fileName) throws Exception {
        List<SpreadsheetItemPreview> items = new ArrayList<>();

        var parser = new CSVParserBuilder().withSeparator(';').build();
        try (var reader = new CSVReaderBuilder(new InputStreamReader(stream, StandardCharsets.UTF_8))
                .withCSVParser(parser).build()) {
            String[] headers = reader.readNext(); // skip header
            if (headers == null) throw new IllegalArgumentException("CSV vazio.");

            String[] row;
            while ((row = reader.readNext()) != null) {
                String description      = get(row, 0);
                String internalCode     = get(row, 1);
                String manufacturerCode = get(row, 2);
                Integer stock           = parseIntStr(get(row, 3));
                BigDecimal cost         = parseBDStr(get(row, 4));
                BigDecimal price        = parseBDStr(get(row, 5));
                String supplierName     = get(row, 6);
                String ncm              = get(row, 7);

                items.add(classify(description, internalCode, manufacturerCode,
                    stock, cost, price, supplierName, ncm));
            }
        }

        return buildResponse(fileName, items);
    }

    private SpreadsheetItemPreview classify(
        String description, String internalCode, String manufacturerCode,
        Integer stock, BigDecimal cost, BigDecimal price,
        String supplierName, String ncm
    ) {
        if (description == null || description.isBlank()) {
            return new SpreadsheetItemPreview(description, internalCode, manufacturerCode,
                stock, cost, price, supplierName, ncm, "DADOS_INCOMPLETOS", "Descrição obrigatória");
        }
        if (cost == null || cost.compareTo(BigDecimal.ZERO) <= 0) {
            return new SpreadsheetItemPreview(description, internalCode, manufacturerCode,
                stock, cost, price, supplierName, ncm, "DADOS_INCOMPLETOS", "Custo inválido");
        }
        return new SpreadsheetItemPreview(description, internalCode, manufacturerCode,
            stock != null ? stock : 0, cost,
            price != null ? price : cost.multiply(BigDecimal.valueOf(1.5)).setScale(2, RoundingMode.HALF_UP),
            supplierName, ncm, "PRONTO_PARA_IMPORTAR", null);
    }

    private SpreadsheetImportPreviewResponse buildResponse(String fileName, List<SpreadsheetItemPreview> items) {
        long ready      = items.stream().filter(i -> "PRONTO_PARA_IMPORTAR".equals(i.status())).count();
        long incomplete = items.stream().filter(i -> "DADOS_INCOMPLETOS".equals(i.status())).count();
        return new SpreadsheetImportPreviewResponse(
            fileName, items.size(), (int) ready, 0, (int) incomplete, items);
    }

    // ─── XLSX helpers ────────────────────────────────────────────────────────────

    private String cellStr(Row row, int col) {
        Cell c = row.getCell(col, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        if (c == null) return null;
        if (c.getCellType() == CellType.STRING) return c.getStringCellValue().trim();
        if (c.getCellType() == CellType.NUMERIC) return String.valueOf((long) c.getNumericCellValue());
        return c.toString().trim();
    }

    private Integer cellInt(Row row, int col) {
        Cell c = row.getCell(col, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        if (c == null) return null;
        if (c.getCellType() == CellType.NUMERIC) return (int) c.getNumericCellValue();
        try { return Integer.parseInt(c.toString().trim()); } catch (Exception e) { return null; }
    }

    private BigDecimal cellBD(Row row, int col) {
        Cell c = row.getCell(col, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        if (c == null) return null;
        if (c.getCellType() == CellType.NUMERIC) {
            return BigDecimal.valueOf(c.getNumericCellValue()).setScale(2, RoundingMode.HALF_UP);
        }
        return parseBDStr(c.toString().trim());
    }

    // ─── CSV helpers ─────────────────────────────────────────────────────────────

    private String get(String[] row, int i) {
        if (i >= row.length) return null;
        String v = row[i].trim();
        return v.isEmpty() ? null : v;
    }

    private Integer parseIntStr(String s) {
        if (s == null) return null;
        try { return Integer.parseInt(s.replace(",", "").replace(".", "")); } catch (Exception e) { return null; }
    }

    private BigDecimal parseBDStr(String s) {
        if (s == null) return null;
        try {
            return new BigDecimal(s.replace(",", ".").replaceAll("[^0-9.]", ""))
                .setScale(2, RoundingMode.HALF_UP);
        } catch (Exception e) { return null; }
    }
}
