export const metadata = {
  title: "Política de Privacidade | Alcyanne Gouveia",
  description: "Política de Privacidade da página de psicoterapia de Alcyanne Gouveia.",
};

export default function PoliticaDePrivacidade() {
  return (
    <main className="privacyPage">
      <header className="privacyHeader">
        <a className="brand" href="/" aria-label="Voltar para a página inicial">
          <span>AG</span>
          <div><strong>Alcyanne Gouveia</strong><small>Psicóloga · CRP 11/15040</small></div>
        </a>
        <a className="privacyBack" href="/">← Voltar</a>
      </header>

      <article className="privacyContent">
        <p className="eyebrow"><i /> Transparência e privacidade</p>
        <h1>Política de Privacidade</h1>
        <p>Esta política explica, de forma simples, como as informações podem ser tratadas ao visitar esta página e iniciar um contato.</p>

        <h2>Contato voluntário</h2>
        <p>O contato é iniciado voluntariamente pelo visitante ao selecionar um dos links para o WhatsApp. O atendimento e a continuidade da conversa acontecem pelo próprio WhatsApp.</p>

        <h2>Dados técnicos de navegação</h2>
        <p>Ferramentas de análise e publicidade poderão registrar dados técnicos de navegação, como informações do dispositivo, páginas acessadas e interações com os botões, para avaliar o funcionamento e a divulgação desta página.</p>

        <h2>Uso das informações</h2>
        <p>Os dados fornecidos voluntariamente são utilizados para responder ao contato e prestar as informações solicitadas. Os dados não serão comercializados.</p>

        <h2>Informações e exclusão de dados</h2>
        <p>Para solicitar informações sobre os dados fornecidos ou pedir sua exclusão, entre em contato pelo WhatsApp (85) 99152-5445.</p>

        <a className="privacyBack bottom" href="/">← Retornar à página de psicoterapia</a>
      </article>
    </main>
  );
}
