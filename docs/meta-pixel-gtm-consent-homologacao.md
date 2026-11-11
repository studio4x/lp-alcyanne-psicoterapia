# Homologação Meta Pixel / GTM — Alcyanne Gouveia

Escopo: domínio `https://psicoterapia.alcyannegouveiapsi.com.br/`, GTM `GTM-NHVT77S`, Meta Pixel `1139534975141260`. Conversão principal: `Lead` via `lead_form_submit` **após confirmação do backend**. Não incluir nome, telefone ou dados de saúde no Pixel, GA4 ou Google Ads.

## Arquitetura efetiva em produção (verificada em 2026-11-11)

- Produção servida pela Hostinger (`hcdn`), usando `index.html`, `hostinger.js`, `public/cookie-consent.js`, `api/leads.php`.
- O HTML de produção contém `lead-modal`, `lead-form` e o container GTM. `GET /api/leads.php?status=1` responde `{"configured":true}` — **não prova persistência do lead**.
- A implementação Vinext/React em `app/` é separada e ainda abre WhatsApp diretamente; **não publicar `app/` como substituta da landing page de produção sem equivalência de formulário e backend**.
- GTM publicado em 2026-11-11 contém Meta base/PageView (ID de tag compilada 61) e Meta Lead (ID 59). As configurações públicas dessas tags não apresentam requisito adicional de `ad_storage`, embora a página defina Google Consent Mode v2. Corrigir no GTM antes de homologar.

## Alterações obrigatórias no Google Tag Manager (UI administrativa)

1. Criar uma versão exportada do container atual antes de editar, para rollback.
2. Abrir a tag Meta base / PageView (ID 61 na versão compilada consultada). Em **Consent settings / Additional Consent Checks**, selecionar **Require additional consent for tag to fire** e incluir `ad_storage`. Em **Tag firing options**, usar **Once per page**.
3. Criar acionador **Custom Event**, nome exato `marketing_consent_granted`, com condição adicional `Page Hostname equals psicoterapia.alcyannegouveiapsi.com.br`. Associá-lo como um segundo acionador (OR) da tag base / PageView, preservando o disparador inicial de Page View restrito ao mesmo domínio.
4. Abrir a tag Meta Lead (ID 59 na versão compilada). Exigir o mesmo consentimento adicional `ad_storage`, mantendo exclusivamente o evento `lead_form_submit` e a restrição de hostname. Não criar outro disparo de Lead no site.
5. Usar **Preview/Tag Assistant** antes de publicar. Publicar a nova versão do GTM **somente** após passar os testes de consentimento e eventos abaixo. Preservar as tags GA4/Google Ads e o Pixel ID atual.
6. O código da landing page deve emitir `marketing_consent_granted` imediatamente após `gtag('consent','update', ...granted)` e apenas quando houver transição de escolha anterior diferente de `granted` para `granted`. A alteração desta branch implementa esse contrato; publicá-la no Hostinger com a atualização dos dois HTML para invalidar cache do script.

**ATENÇÃO:** Consent Mode do Google não bloqueia automaticamente Custom HTML da Meta. Adicionar somente `gtag('consent','update')` é insuficiente. O requisito adicional nas duas tags é obrigatório.

## Matriz de testes reais

Executar preferencialmente em navegador isolado, sem extensões de bloqueio, e registrar tráfego de `connect.facebook.net`, `facebook.com/tr`, estado do `dataLayer`, Tag Assistant e Meta Events Manager/Test Events. Não enviar lead real na homologação sem ambiente/destinatário controlado.

| Cenário | Resultado obrigatório |
| --- | --- |
| Visitante novo, antes de escolher | Nenhum `PageView` Meta, nenhum `fbevents.js` nem `_fbp`; consentimento negado |
| Recusar cookies e navegar | Nenhum evento de marketing Meta |
| Aceitar depois de a página carregar | Exatamente um `PageView` Meta; consentimento atualizado antes do evento de reativação |
| Reabrir preferências e aceitar de novo | Nenhum `PageView` adicional na mesma página |
| Recarregar com aceite persistido | Exatamente um `PageView` Meta |
| Revogar aceite | Eventos Meta futuros bloqueados; cookies já transmitidos não são retroativamente apagados |
| Abrir modal | `lead_form_open` no `dataLayer`, nenhum `Lead` |
| Formulário inválido | Nenhum `lead_form_submit` / `Lead` |
| Falha no salvamento (erro backend) | Nenhum `lead_form_submit` / `Lead` |
| Formulário válido, backend confirma sucesso, com aceite | Exatamente um `lead_form_submit` e um `Lead` Meta |
| Formulário válido, sem aceite de marketing | Lead registrado no backend mas nenhum evento `Lead` Meta; consentimento do formulário é independente do consentimento de marketing |
| Qualquer evento de tracking | Nenhum nome, WhatsApp, texto livre, hipótese diagnóstica ou informação clínica transmitidos |

## Critérios de liberação

- Os testes de código e a validação visual da LP estática passam.
- O HTML e o script com cache atualizado estão efetivamente publicados no **domínio de produção**.
- Versão do GTM publicada identificada; as duas tags exigem `ad_storage`.
- Meta Test Events confirma `PageView` e `Lead` nos cenários autorizados, sem duplicação.
- Integração de leads registra um teste controlado ponta a ponta; nenhum dado clínico/pessoal aparece no payload de tracking.
- Somente então a campanha pode usar `Lead` como evento principal.

## Rollback

- Se o consentimento ou `PageView` falharem em produção, restaurar no GTM a versão previamente exportada **somente se ela não reintroduzir disparo sem consentimento**; caso contrário, pausar as tags Meta até nova correção.
- Restaurar os arquivos HTML e JS anteriores apenas em conjunto com uma configuração GTM segura. Invalidar cache após rollback.
- Nunca reabilitar marketing sem consentimento apenas para recuperar volume de eventos.

## Registro da verificação

- 2026-11-11: leitura do código via GitHub e verificação HTTP pública da página, assets e status da API. Nenhum lead real enviado.
- 2026-11-11: consulta pública de `gtm.js` confirmou tags 59 e 61, pixel e gatilhos em produção. Ausência de consentimento adicional no código compilado.
- Testes automatizados locais do fluxo de consentimento precisam ser associados ao SHA desta branch; não substituem a validação de rede no navegador, no GTM nem na Meta.
