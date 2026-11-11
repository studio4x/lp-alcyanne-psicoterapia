# Alcyanne — Correção do contrato de leads (2026-11-11)

## Escopo e evidências
- Produção: `https://psicoterapia.alcyannegouveiapsi.com.br/`; API PHP: `api/leads.php`.
- n8n: workflow `GOci2p7EAzcHkKKB` — "Alcyanne | Leads da LP de Psicoterapia".
- API PHP permite seis `cta_location`; código ativo do node `Validar e preparar lead` permite cinco, sem `psicologa-fortaleza`.
- n8n limita até cinco tentativas/hora por WhatsApp; PHP limita dez tentativas/hora por IP. **Não aumentar ou desabilitar estes limites.**
- Em 2026-11-11, cinco envios de teste foram registrados na aba `Leads`, todos para o mesmo telefone. Os testes posteriores mostraram erros 503/429, compatíveis com proteção de tentativas.
- n8n devolve `429` com JSON `{ok:false,code:"rate_limited"}`; anteriormente o PHP transformava isso em `503` genérico.

## Correção PHP no PR
Preservar HTTP `429` **exclusivamente** quando o webhook responder status 429 e JSON válido classificado como `code: rate_limited`. Para rede indisponível, 5xx, JSON inválido ou erro sem classificação, continuar `503`, sem liberar evento de conversão. Resposta de sucesso continua `201` apenas após `ok:true`.

## Correção n8n pendente (exatamente uma linha)

**Atenção: NÃO substituir o workflow inteiro com o editor MCP atual.** O validador do SDK rejeita `config.id`, gera IDs novos para os nós e o retorno MCP oculta os vínculos de credenciais; isso coloca em risco o Google Sheets e os endpoints ativos. Usar a interface do editor n8n para alterar somente o node existente:

Workflow: `GOci2p7EAzcHkKKB`. Node: `Validar e preparar lead`.

Trocar:
```javascript
const allowedCtas = ['header', 'hero', 'como-funciona', 'cta-final', 'flutuante'];
```
Por:
```javascript
const allowedCtas = ['header', 'hero', 'como-funciona', 'psicologa-fortaleza', 'cta-final', 'flutuante'];
```

Preservar integralmente os outros nós, `webhookId`, conexões, credenciais Google Sheets, segredo `ALCYANNE_LEADS_WEBHOOK_SECRET`, `ALCYANNE_ALLOWED_ORIGIN`, limites por telefone, deduplicação por `lead_id`, status e resposta de sucesso. Exportar o JSON do workflow antes de salvar; publicar nova versão apenas após conferir o diff de uma linha e os vínculos de credenciais. O formulário `psicologa-fortaleza` deve ser reconhecido sem reclassificar a origem como outro CTA.

## Homologação sem leads reais
- No PHP: `php -l api/leads.php`, depois `node --test tests/leads-api-php.test.mjs` com `curl` e `mbstring` presentes. O teste sobe dois servidores localhost; nunca chama o n8n, Meta ou planilha reais.
- No n8n: confirmar que os seis valores estão no código da versão publicada; **não** executar webhook real repetidamente.
- Em produção: inspecionar rede e logs de um único envio controlado **após expiração das proteções** e verificar o mesmo `lead_id` na planilha. Meta Lead exige consentimento e confirmação do backend.
- Confirmar que `429` agora apresenta instrução para aguardar, nunca evento `lead_form_submit`.
- GTM continua em homologação, não publicar a campanha enquanto o `Lead` real não for confirmado na Meta.

## Rollback
- PHP: reverter o commit de correção e confirmar o SHA público antes de testar. Não restaurar código com bypass de validação.
- n8n: restaurar **a versão imediatamente anterior** exportada e republicar, preservando credenciais; não desfazer outras alterações em paralelo.
- Se a falha puder provocar dados perdidos/duplicados, manter o formulário fail-closed e a campanha bloqueada.

## Relatório obrigatório
Informar SHA do PHP, status do CI, hash do PHP servido, versão n8n ativa, diffs de origens, existência de backup e resultados de uma execução controlada. Relatório do agente não substitui evidência.
