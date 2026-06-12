package com.garagepro.api.parser;

import com.garagepro.api.dto.imports.NfeImportPreviewResponse;
import com.garagepro.api.dto.imports.NfeItemPreview;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
public class NfeXmlParser {

    private static final String NFE_NS = "http://www.portalfiscal.inf.br/nfe";

    private static final Map<String, Double> CATEGORY_MARGINS = Map.of(
        "Filtros",       70.0,
        "Freios",        60.0,
        "Lubrificantes", 40.0,
        "Ignição",       55.0,
        "Baterias",      35.0,
        "Suspensão",     55.0
    );

    public NfeImportPreviewResponse parse(InputStream xml) throws Exception {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setNamespaceAware(true);
        // Disable external entity processing for security
        factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
        DocumentBuilder builder = factory.newDocumentBuilder();
        Document doc = builder.parse(xml);
        doc.getDocumentElement().normalize();

        // ide
        String invoiceNumber = getText(doc, "nNF");
        String series        = getText(doc, "serie");
        String issueDate     = parseDate(getText(doc, "dhEmi"));

        // emit
        String supplierDocument = getText(doc, "CNPJ");
        if (supplierDocument == null || supplierDocument.isBlank()) {
            supplierDocument = getText(doc, "CPF");
        }
        String supplierName = getText(doc, "xNome");

        // access key — try chNFe first, then infNFe Id attribute
        String accessKey = getText(doc, "chNFe");
        if (accessKey == null || accessKey.isBlank()) {
            NodeList infNFe = doc.getElementsByTagNameNS(NFE_NS, "infNFe");
            if (infNFe.getLength() == 0) infNFe = doc.getElementsByTagName("infNFe");
            if (infNFe.getLength() > 0) {
                String id = ((Element) infNFe.item(0)).getAttribute("Id");
                accessKey = id.startsWith("NFe") ? id.substring(3) : id;
            }
        }

        // total
        BigDecimal totalValue = parseBD(getText(doc, "vNF"));
        if (totalValue == null) totalValue = parseBD(getText(doc, "vProd"));

        // items
        NodeList detList = doc.getElementsByTagNameNS(NFE_NS, "det");
        if (detList.getLength() == 0) detList = doc.getElementsByTagName("det");

        List<NfeItemPreview> items = new ArrayList<>();
        for (int i = 0; i < detList.getLength(); i++) {
            Element det = (Element) detList.item(i);

            Element prod = firstChild(det, "prod");
            if (prod == null) continue;

            String supplierCode = getChildText(prod, "cProd");
            String description  = getChildText(prod, "xProd");
            String ncm          = getChildText(prod, "NCM");
            String cfop         = getChildText(prod, "CFOP");
            String unit         = getChildText(prod, "uCom");
            BigDecimal qty      = parseBD(getChildText(prod, "qCom"));
            BigDecimal unitCost = parseBD(getChildText(prod, "vUnCom"));
            BigDecimal totalCost = parseBD(getChildText(prod, "vProd"));

            int qtyInt = qty != null ? qty.intValue() : 1;
            if (unitCost == null || unitCost.compareTo(BigDecimal.ZERO) == 0) {
                unitCost = totalCost != null && qtyInt > 0
                    ? totalCost.divide(BigDecimal.valueOf(qtyInt), 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;
            }
            if (totalCost == null) {
                totalCost = unitCost.multiply(BigDecimal.valueOf(qtyInt));
            }

            String category = inferCategory(description, ncm, cfop);
            double margin = CATEGORY_MARGINS.getOrDefault(category, 50.0);
            BigDecimal suggestedSalePrice = unitCost
                .multiply(BigDecimal.valueOf(1 + margin / 100))
                .setScale(2, RoundingMode.HALF_UP);

            items.add(new NfeItemPreview(
                supplierCode, description, ncm, cfop, unit,
                qtyInt, unitCost, totalCost,
                suggestedSalePrice, margin,
                "NOVA_PECA", null, null
            ));
        }

        return new NfeImportPreviewResponse(
            invoiceNumber, series, accessKey,
            supplierName, supplierDocument, issueDate,
            totalValue != null ? totalValue : BigDecimal.ZERO,
            items
        );
    }

    private String inferCategory(String description, String ncm, String cfop) {
        if (description == null) return "Outros";
        String d = description.toLowerCase();
        if (d.contains("filtro de óleo") || d.contains("filtro oleo") || d.contains("filtro ar") ||
            d.contains("filtro combustível") || d.contains("filtro cabine")) return "Filtros";
        if (d.contains("óleo") || d.contains("oleo") || d.contains("fluido") ||
            d.contains("lubrificante")) return "Lubrificantes";
        if (d.contains("pastilha") || d.contains("disco") || d.contains("freio") ||
            d.contains("lona")) return "Freios";
        if (d.contains("vela") || d.contains("bobina") || d.contains("cabo")) return "Ignição";
        if (d.contains("bateria")) return "Baterias";
        if (d.contains("amortecedor") || d.contains("mola") || d.contains("suspensão") ||
            d.contains("suspensao")) return "Suspensão";
        if (d.contains("correia") || d.contains("embreagem")) return "Transmissão";
        if (d.contains("palheta") || d.contains("limpador")) return "Palhetas";
        return "Outros";
    }

    private String parseDate(String iso) {
        if (iso == null) return null;
        // ISO 8601: 2026-06-10T10:00:00-03:00 → 2026-06-10
        return iso.length() >= 10 ? iso.substring(0, 10) : iso;
    }

    private String getText(Document doc, String tagName) {
        NodeList ns = doc.getElementsByTagNameNS(NFE_NS, tagName);
        if (ns.getLength() == 0) ns = doc.getElementsByTagName(tagName);
        return ns.getLength() > 0 ? ns.item(0).getTextContent().trim() : null;
    }

    private String getChildText(Element parent, String tagName) {
        NodeList ns = parent.getElementsByTagNameNS(NFE_NS, tagName);
        if (ns.getLength() == 0) ns = parent.getElementsByTagName(tagName);
        return ns.getLength() > 0 ? ns.item(0).getTextContent().trim() : null;
    }

    private Element firstChild(Element parent, String tagName) {
        NodeList ns = parent.getElementsByTagNameNS(NFE_NS, tagName);
        if (ns.getLength() == 0) ns = parent.getElementsByTagName(tagName);
        return ns.getLength() > 0 ? (Element) ns.item(0) : null;
    }

    private BigDecimal parseBD(String s) {
        if (s == null || s.isBlank()) return null;
        try { return new BigDecimal(s.trim()); } catch (NumberFormatException e) { return null; }
    }
}
