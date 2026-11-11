# GTM Consent Mode — ponte prioritária (`GTM-NHVT77S`)

**Status: preparado para importação e QA; não é uma publicação de GTM.**

## Causa confirmada e contrato

- O acionador `marketing_consent_granted` reconhecia o evento e o domínio, mas a Meta Pixel Base ficava bloqueada na primeira escolha.
- A LP usava `gtag('consent','update')` imediatamente antes do evento, sujeito à ordem tardia de processamento na fila do GTM.
- O `GTM-NHVT77S` é o único container do site; Meta Pixel ID `1139534975141260` e Lead via `lead_form_submit` após persistência são invariantes.

### Mudança no site

`public/cookie-consent.js` e `app/components/CookieConsent.tsx` mantêm o `gtag('consent','update')` anterior como compatibilidade enquanto o GTM ainda não publica a ponte. Em seguida, enviam:

```javascript
window.dataLayer.push({
  event: "s4x_consent_update",
  s4x_consent_choice: choice // "granted" ou "denied"
});
```

Somente depois da atualização, se houve transição para `granted`, enviam `marketing_consent_granted`. Não é enviado qualquer dado pessoal.

### Configuração do GTM — somente em Visualizar antes de publicar

Importe a exportação **GTM-NHVT77S_Alcyanne_Sincronizacao_Consentimento_v3_2026-11-11.json** usando **Combinar → Substituir itens conflitantes**, no container `GTM-NHVT77S`. Essa exportação foi gerada a partir do último JSON de QA entregue ao cliente, incluindo o guard JS contra PageView duplicado.

A exportação adiciona **apenas**:
- Template customizado `[S4X] Consent | Atualização prioritária` (arquivo correspondente em `gtm/s4x-consent-update.tpl`);
- Variável DLV `[S4X] DLV | s4x_consent_choice` (versão 2);
- Acionador `[S4X] Consent | Atualizar estado – Psicoterapia`, evento `s4x_consent_update`, somente hostname `psicoterapia.alcyannegouveiapsi.com.br`;
- Tag `[S4X] Consent | Sincronização prioritária – Psicoterapia` com tipo do template, disparada no acionador acima, opção **Uma vez por evento**, sem exigência de consentimento adicional (a tag deve atualizar também para `denied`).

O template chama `updateConsentState()` para `ad_storage`, `analytics_storage`, `ad_user_data` e `ad_personalization`. Ele rejeita escolhas não reconhecidas com `gtmOnFailure` e **nunca concede** por valor desconhecido. Permissão de gravação de consentimento para os quatro tipos.

**Não importe o arquivo .tpl separadamente se o JSON já trouxe o template corretamente** — ele está no repositório apenas para inspeção ou recuperação manual.

O default de consentimento inicial continua no `index.html` antes do GTM, negado por padrão para visitantes novos; o acesso persistido ainda funciona. Não trocar a tag Pixel Base de `ONCE_PER_EVENT`, nem remover a exigência `ad_storage` da Meta Base e Meta Lead.

## Testes reais obrigatórios (Tag Assistant + rede + Meta Test Events)

1. Em visitante novo sem consentimento, não disparar Meta PageView/Lead; conferir `ad_storage=denied` e ausência de `facebook.com/tr`.
2. Recusar: `s4x_consent_update` com `denied`; tag de sincronização dispara, Meta não.
3. Aceitar na mesma página: `s4x_consent_update` com `granted`; tag de sincronização dispara, `ad_storage=granted`; próximo `marketing_consent_granted` aciona Meta Pixel Base exatamente uma vez, com requisição `PageView` recebida na Meta.
4. Reabrir e aceitar sem mudança: zero PageViews adicionais.
5. Recarregar com consentimento salvo: um PageView por novo carregamento.
6. Revogar: `ad_storage=denied`; nenhum evento Meta posterior. Revogação não desfaz transmissões anteriores.
7. Abrir modal: `lead_form_open`, zero Lead. Formulário inválido: zero Lead. Falha backend: zero Lead.
8. Formulário válido controlado: backend confirmou, `lead_form_submit` uma vez, Meta Lead exatamente uma vez se marketing consentido; sem marketing consentido, nenhum evento Meta Lead. Sem PII nas tags e requests.
9. Inspecionar preview de importação: tags GA4, Google Ads, e Pixel ID não foram modificados; nenhum template duplicado.
10. Conferir que homepage, página de privacidade e script atualizado estão efetivamente servidos com os hashes da `main`; conferir que formulário, API e navegação continuam funcionando.

Não publicar container nem liberar campanha até todos os testes acima terem evidências. Testes de código/JSON **não substituem** o GTM Preview e o Meta Test Events.

## Rollback

- **LP:** reverter o commit desse PR na `main` e publicar `index.html`, `politica-de-privacidade/index.html` e `public/cookie-consent.js` em conjunto, invalidando o cache.
- **GTM:** manter uma exportação anterior do workspace e restaurá-la por mesclagem, sem remover as verificações de consentimento das tags Meta. Se não for possível assegurar que a restauração não envie Meta sem consentimento, pausar as duas tags Meta.
- Nunca restaurar disparo sem consentimento apenas para manter conversões.
