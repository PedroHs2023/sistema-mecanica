# GaragePro

ERP para oficinas mecânicas desenvolvido do zero com Java 21 e Spring Boot 3. O sistema cobre o ciclo completo da oficina: entrada de peças, atendimento ao cliente, execução do serviço, cobrança e emissão de nota fiscal.

## Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Linguagem | Java 21 |
| Framework | Spring Boot 3.3.13 |
| Segurança | Spring Security + JWT (jjwt 0.12.6) |
| Banco de dados | MySQL 8.0 |
| ORM | JPA / Hibernate 6 |
| Migrations | Flyway (17 versões) |
| Redução de boilerplate | Lombok |
| Leitura de planilha | Apache POI 5.3 |
| Leitura de CSV | OpenCSV 5.9 |
| Build | Maven |

## Funcionalidades

### Autenticação e Segurança
- Registro e login por empresa (multi-tenancy)
- JWT com expiração configurável
- Filtro de autenticação em todas as rotas protegidas
- Cada empresa enxerga apenas seus próprios dados

### Fornecedores
- Cadastro completo com CNPJ, contato e status (ativo/inativo)
- Soft delete (desativação sem exclusão física)

### Peças e Estoque
- Cadastro de peças com código, unidade e preço de custo/venda
- Controle de estoque com quantidade mínima e alertas
- Movimentações de estoque (entrada/saída) com rastreabilidade
- Registro de compras e itens de compra vinculados a fornecedores

### Importação de Peças
- **Via NF-e XML** — leitura de XML de nota fiscal de entrada, preview dos itens e confirmação seletiva para o estoque
- **Via Planilha** — importação em massa por arquivo `.xlsx` ou `.csv` com preview antes de confirmar
- Histórico de importações com status e data

### Clientes e Veículos
- Clientes pessoa física (CPF) e jurídica (CNPJ)
- Múltiplos veículos por cliente (placa, marca, modelo, ano, cor)
- Soft delete em clientes e veículos

### Catálogo de Serviços
- Cadastro de serviços com nome, descrição e preço de tabela
- Soft delete

### Ordem de Serviço (OS)
- Abertura de OS vinculada a cliente e veículo
- Adição de serviços e peças com snapshot de preço no momento da OS
- Cálculo automático de totais (serviços + peças)
- Fluxo de status: `ABERTA → EM_ANDAMENTO → AGUARDANDO_PECAS → CONCLUIDA → CANCELADA`
- Registro de `closed_at` automático na conclusão
- Numeração sequencial por empresa (OS-001, OS-002...)

### Financeiro
- Registro de pagamentos vinculados à OS
- Métodos: dinheiro, PIX, cartão de crédito, cartão de débito, transferência
- Cálculo automático de status da OS: `PENDENTE → PARCIAL → PAGO`
- Suporte a pagamentos parciais e múltiplos pagamentos por OS

### Nota Fiscal de Saída (NF-e)
- Estrutura completa para emissão de NF-e
- Dados fiscais por empresa: IE, IM, CNAE, CRT, série, ambiente (homologação/produção)
- Itens com NCM, CFOP, CSOSN, PIS, COFINS e ICMS
- Numeração automática e sequencial por empresa
- Status: `PENDENTE → ENVIADA → AUTORIZADA → REJEITADA → CANCELADA`
- Integração com SEFAZ via [Java-NFe](https://github.com/Samuel-Oliveira/Java_NFe) planejada para a Fase 2 (requer certificado digital A1)

## Arquitetura

```
Controller → Service → Repository → Entity
```

- **Controllers** — recebem HTTP, delegam ao Service, retornam DTOs
- **Services** — regras de negócio, @Transactional
- **Repositories** — interfaces JPA, queries customizadas quando necessário
- **Entities** — mapeamento JPA com Lombok
- **DTOs** — Java Records (imutáveis, sem boilerplate)
- **Migrations** — todo DDL gerenciado pelo Flyway, `ddl-auto: validate`

## Estrutura do Projeto

```
sistema-mecanica/
└── backend/
    └── src/main/java/com/garagepro/api/
        ├── config/          # JWT, Security, CORS, DataSeeder
        ├── controller/      # Endpoints REST
        ├── dto/             # Records de entrada e saída
        ├── entity/          # Entidades JPA
        │   └── enums/       # Enumerações
        ├── exception/       # GlobalExceptionHandler
        ├── parser/          # Leitura de XML e planilhas
        ├── repository/      # Interfaces JPA
        └── service/         # Regras de negócio
```

## Pré-requisitos

- Java 21+
- MySQL 8.0+
- Maven 3.9+

## Instalação e Execução

```bash
# 1. Clone o repositório
git clone https://github.com/PedroHs2023/sistema-mecanica.git
cd sistema-mecanica/backend

# 2. Crie o banco de dados
mysql -u root -p
CREATE DATABASE garagepro;

# 3. Configure as credenciais em src/main/resources/application.yml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/garagepro
    username: seu_usuario
    password: sua_senha

# 4. Execute — o Flyway aplica as migrations automaticamente
mvn spring-boot:run
```

A API estará disponível em `http://localhost:8080`.

## Endpoints Principais

### Auth
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/register` | Registrar empresa e usuário admin |
| POST | `/api/auth/login` | Autenticar e receber JWT |

### Clientes e Veículos
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/customers` | Listar clientes |
| POST | `/api/customers` | Cadastrar cliente |
| GET | `/api/customers/{id}/vehicles` | Veículos do cliente |
| POST | `/api/customers/{id}/vehicles` | Adicionar veículo |

### Ordem de Serviço
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/service-orders` | Abrir OS |
| GET | `/api/service-orders` | Listar OS |
| GET | `/api/service-orders/{id}` | Detalhes da OS |
| PATCH | `/api/service-orders/{id}/status` | Atualizar status |

### Financeiro
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/payments` | Registrar pagamento |
| GET | `/api/payments/service-order/{id}` | Pagamentos da OS |

### Peças e Estoque
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/parts` | Listar peças |
| POST | `/api/parts` | Cadastrar peça |
| GET | `/api/stock-movements` | Histórico de movimentações |

### Importação
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/imports/nfe/preview` | Preview de NF-e XML |
| POST | `/api/imports/nfe/confirm` | Confirmar itens da NF-e |
| POST | `/api/imports/spreadsheet/preview` | Preview de planilha |
| POST | `/api/imports/spreadsheet/confirm` | Confirmar itens da planilha |

### NF-e
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/nfe` | Criar NF-e |
| GET | `/api/nfe` | Listar NF-e |
| GET | `/api/nfe/{id}` | Detalhes da NF-e |
| POST | `/api/nfe/{id}/enviar` | Enviar para SEFAZ (Fase 2) |

## Banco de Dados

17 migrations Flyway cobrindo toda a evolução do schema:

| Migration | Descrição |
|-----------|-----------|
| V1–V4 | Tabelas base: fornecedores, peças, estoque, compras |
| V5 | Dados iniciais (seed) |
| V6–V8 | Empresas, usuários e multi-tenancy |
| V9–V11 | Clientes, veículos e ajustes de nulabilidade |
| V12 | Catálogo de serviços |
| V13 | Ordens de serviço |
| V14 | Pagamentos e status financeiro |
| V15–V17 | Dados fiscais e NF-e |

## Próximos Passos

- [ ] Módulo de relatórios (faturamento por período, OS por status)
- [ ] Dashboard com indicadores do dia
- [ ] NF-e Fase 2 — integração real com SEFAZ via Java-NFe (requer certificado digital A1)
- [ ] Frontend web

## Autor

Pedro Henrique — [GitHub](https://github.com/PedroHs2023)

---

*Projeto desenvolvido para aprendizado e portfólio. Construído módulo a módulo, entendendo cada decisão de arquitetura.*
