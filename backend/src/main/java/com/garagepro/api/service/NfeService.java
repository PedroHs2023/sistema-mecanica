package com.garagepro.api.service;

import com.garagepro.api.dto.nfe.*;
import com.garagepro.api.entity.Nfe;
import com.garagepro.api.entity.NfeItem;
import com.garagepro.api.entity.enums.NfeAmbiente;
import com.garagepro.api.entity.enums.NfeStatus;
import com.garagepro.api.repository.CompanyRepository;
import com.garagepro.api.repository.NfeRepository;
import com.garagepro.api.repository.ServiceOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NfeService {

    private final NfeRepository nfeRepository;
    private final CompanyRepository companyRepository;
    private final ServiceOrderRepository serviceOrderRepository;

    @Transactional
    public NfeResponse create(NfeRequest request, Long companyId) {
        var company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Empresa não encontrada"));

        if (company.getCertificate() == null) {
            throw new RuntimeException("Empresa não possui certificado digital cadastrado");
        }

        var serviceOrder = request.serviceOrderId() != null
                ? serviceOrderRepository.findById(request.serviceOrderId())
                        .orElseThrow(() -> new RuntimeException("Ordem de Serviço não encontrada"))
                : null;

        int proximoNumero = (company.getNfeUltimoNumero() != null ? company.getNfeUltimoNumero() : 0) + 1;

        List<NfeItem> items = new ArrayList<>();
        BigDecimal totalProdutos = BigDecimal.ZERO;
        int numeroItem = 1;

        for (var itemReq : request.items()) {
            BigDecimal valorTotal = itemReq.valorUnitario()
                    .multiply(itemReq.quantidade());
            totalProdutos = totalProdutos.add(valorTotal);

            items.add(NfeItem.builder()
                    .numeroItem(numeroItem++)
                    .codigoProduto(itemReq.codigoProduto())
                    .descricao(itemReq.descricao())
                    .ncm(itemReq.ncm())
                    .cfop(itemReq.cfop())
                    .unidade(itemReq.unidade())
                    .quantidade(itemReq.quantidade())
                    .valorUnitario(itemReq.valorUnitario())
                    .valorTotal(valorTotal)
                    .csosn(itemReq.csosn() != null ? itemReq.csosn() : "400")
                    .build());
        }

        var nfe = Nfe.builder()
                .company(company)
                .serviceOrder(serviceOrder)
                .numero(proximoNumero)
                .serie(company.getNfeSerie() != null ? company.getNfeSerie() : 1)
                .status(NfeStatus.PENDENTE)
                .ambiente(NfeAmbiente.HOMOLOGACAO)
                .naturezaOperacao(request.naturezaOperacao())
                .dataEmissao(LocalDateTime.now())
                .destNome(request.destNome())
                .destCpfCnpj(request.destCpfCnpj())
                .destIe(request.destIe())
                .destEmail(request.destEmail())
                .destLogradouro(request.destLogradouro())
                .destNumero(request.destNumero())
                .destBairro(request.destBairro())
                .destMunicipio(request.destMunicipio())
                .destUf(request.destUf())
                .destCep(request.destCep())
                .totalProdutos(totalProdutos)
                .totalDesconto(BigDecimal.ZERO)
                .totalNfe(totalProdutos)
                .items(items)
                .build();

        items.forEach(item -> item.setNfe(nfe));

        var saved = nfeRepository.save(nfe);

        company.setNfeUltimoNumero(proximoNumero);
        companyRepository.save(company);

        return toResponse(saved);
    }

    @Transactional
    public NfeResponse enviar(Long id) {
        var nfe = nfeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("NF-e não encontrada"));

        if (nfe.getStatus() != NfeStatus.PENDENTE) {
            throw new RuntimeException("Apenas NF-e com status PENDENTE pode ser enviada");
        }

        // TODO: integrar com Java-NFe para assinar e enviar para SEFAZ
        // Exemplo futuro:
        // ConfiguracaoNFe config = buildConfig(nfe.getCompany());
        // NfeAutorizacao autorizacao = NfeAutorizacaoSincrono.autorizacao(config, nfeXml);
        // nfe.setChave(autorizacao.getChave());
        // nfe.setProtocolo(autorizacao.getProtocolo());
        // nfe.setStatus(NfeStatus.AUTORIZADA);

        throw new RuntimeException("Integração com SEFAZ ainda não implementada. Aguardando certificado digital.");
    }

    @Transactional(readOnly = true)
    public List<NfeResponse> listAll(Long companyId) {
        return nfeRepository.findAllByCompanyId(companyId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public NfeResponse findById(Long id) {
        var nfe = nfeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("NF-e não encontrada"));
        return toResponse(nfe);
    }

    private NfeResponse toResponse(Nfe nfe) {
        var items = nfe.getItems().stream()
                .map(item -> new NfeItemResponse(
                        item.getId(),
                        item.getNumeroItem(),
                        item.getCodigoProduto(),
                        item.getDescricao(),
                        item.getNcm(),
                        item.getCfop(),
                        item.getUnidade(),
                        item.getQuantidade(),
                        item.getValorUnitario(),
                        item.getValorTotal(),
                        item.getCsosn()))
                .toList();

        return new NfeResponse(
                nfe.getId(),
                nfe.getNumero(),
                nfe.getSerie(),
                nfe.getChave(),
                nfe.getStatus(),
                nfe.getAmbiente(),
                nfe.getNaturezaOperacao(),
                nfe.getProtocolo(),
                nfe.getDestNome(),
                nfe.getDestCpfCnpj(),
                nfe.getTotalProdutos(),
                nfe.getTotalDesconto(),
                nfe.getTotalNfe(),
                nfe.getDataEmissao(),
                nfe.getDataAutorizacao(),
                nfe.getMotivoRejeicao(),
                items);
    }
}
