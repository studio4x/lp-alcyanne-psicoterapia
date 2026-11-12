# Auditoria e ajuste de mensuração — Alcyanne — 12/11/2026

## Fato principal e limitação
- Formulário em produção grava no n8n/Google Sheets; dois leads de 12/11/2026 possuem UTM `ig/paid` e mesma campanha `120252672096800199`.
- GTM `GTM-NHVT77S`, Meta Pixel `1139534975141260`.
- Arquivo de configuração que a Meta entregou ao navegador apresentou `eventValidation.restrictedEventNames = ["Lead"]`; a interface informou categoria de saúde e restrição a eventos padrão. **Uma alteração de GTM ou do site não pode liberar evento bloqueado pela Meta ou recuperá-lo retroativamente.** Não renomear `Lead` para evento customizado que represente a mesma conversão, não usar Conversions API como bypass e não compartilhar nome, telefone ou dados sensíveis com Meta.
- `PageView` pode ter condições diferentes de `Lead`; testar captura de rede em navegador real, pois headless/automação pode sofrer bloqueio de tráfego de bot.

## Arquivos da landing
- `hostinger.js`: mostrar mensagem específica para `HTTP 429` e evitar novo clique imediato de retry. NÃO altera evento `lead_form_submit`, envio para n8n, redirecionamento WhatsApp, identidade ou UTMs.
- `index.html`: atualização de query param de cache do `hostinger.js`.
- `politica-de-privacidade/index.html`: aviso explícito sobre Meta Pixel e separação consentimento formulário vs. marketing.
- `tests/hostinger-static.test.mjs`: cobertura de retorno 429 sem conversão e do aviso de privacidade.
- `.github/workflows/qa-landing-measurement.yml`: testes reais em Node.js dos scripts e contratos de consentimento.

## GTM — atualização preparada, não publicada automaticamente
- Origem: exportação enviada em 11/11/2026, 20:52:35; 10 tags, 6 triggers, 7 variables, 1 template.
- Arquivo de importação fornecido separadamente: `GTM-NHVT77S_Alcyanne_Sequenciamento_Seguro_2026-11-12.json`.
- ÚNICA alteração estrutural: tag Meta Lead `tagId 59` agora tem `setupTag` usando `[S4X] META | Pixel Base – Psicoterapia`, `stopOnSetupFailure:true`; isso inicializa o Pixel antes da tentativa permitida de `Lead`. A base tem guarda interna contra `PageView` duplicado. Os requisitos de consentimento `ad_storage`, gatilhos, Pixel ID, GA4 e Google Ads permanecem inalterados.
- **Não é desbloqueio de evento restrito.** Com `Lead` na lista da Meta, a tag pode executar sem qualquer conversão atribuída. Se a restrição persistir, campanhas devem usar uma forma de captação/otimização permitida pela Meta, mantendo o registro de leads reais separado.
- O arquivo requer importação em workspace GTM: criar export/backup da versão atual, **Importar → Combinar → Substituir itens conflitantes**, confirmar diff somente na tag 59. Executar Visualizar antes de publicar. Nunca importar sobre configuração que mudou sem reconciliar o JSON.

## Matriz de homologação
1. Consentimento inicial negado → nenhum request Meta, sem Pixel carregado, nenhuma PII.
2. Consentimento concedido → `s4x_consent_update` primeiro, depois `marketing_consent_granted`, `ad_storage` granted e `PageView` no máximo uma vez por carregamento.
3. Novo carregamento com aceite → apenas um novo `PageView`. Aceitar sem troca de estado → zero adicionais.
4. Revogar consentimento → bloqueio de eventos seguintes; não reenviar eventos recusados.
5. Backend 429/503 ou formulário inválido → zero `lead_form_submit` e zero Meta Lead.
6. Sucesso controlado → 1 registro em Sheets, 1 `lead_form_submit`; conferir Tag Assistant, pedido de rede `facebook.com/tr?ev=Lead` e Meta Events Manager, respeitando bloqueios atuais.
7. Nunca incluir nome, telefone, diagnóstico, textos clínicos em `dataLayer`, Meta, GA4 ou Google Ads.
8. Resultado comercial via UTMs ≠ atribuição oficial da plataforma. Manter ambos no relatório separados.

## Critérios para fechar
- PR com CI PASS, arquivos públicos da Hostinger conferidos após merge, sem novos registros de teste em produção.
- GTM importado, diff de uma tag e Preview de consentimento PASS; publicação opcional apenas após homologação.
- Diagnóstico do Pixel na Meta: se `restrictedEventNames` ainda contiver `Lead`, marcar mensuração da campanha como **não homologada**, independentemente do GTM; não tentar forçar resultado.

## Rollback
- Reverter a alteração de `hostinger.js`, `index.html` e página de privacidade em commit isolado e verificar cache/CDN.
- GTM: restaurar versão exportada anterior à importação se houver regressão técnica, preservando bloqueios de consentimento e políticas Meta. Não reativar rastreamento sem consentimento.
- Não apagar leads, mudar n8n, planilha, links, orçamentos ou objetivo de campanha nesta alteração.

## Relatório
Relatar SHAs, CI, arquivos públicos conferidos, GTM diff, status de consentimento, eventos permitidos/restritos na Meta, rollback e bloqueios restantes. Não tratar o relatório do implementador como validação externa.
