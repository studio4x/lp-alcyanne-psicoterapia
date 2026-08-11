import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidade | Alcyanne Gouveia",
  description: "Política de Privacidade da página de psicoterapia de Alcyanne Gouveia.",
  alternates: { canonical: "/politica-de-privacidade/" },
};

export default function PoliticaDePrivacidade() {
  return (
    <main className="privacyPage">
      <header className="privacyHeader">
        <Link className="brand" href="/" aria-label="Voltar para a página inicial">
          <span>AG</span>
          <div><strong>Alcyanne Gouveia</strong><small>Psicóloga · CRP 11/15040</small></div>
        </Link>
        <Link className="privacyBack" href="/">← Voltar</Link>
      </header>

      <article className="privacyContent">
        <p className="eyebrow"><i /> Transparência e privacidade</p>
        <h1>Política de Privacidade</h1>
        <p>Esta política explica, de forma simples, como as informações podem ser tratadas ao visitar esta página e iniciar um contato.</p>

        <h2>Contato voluntário</h2>
        <p>O contato é iniciado voluntariamente pelo visitante ao selecionar um dos links para o WhatsApp. O atendimento e a continuidade da conversa acontecem pelo próprio WhatsApp.</p>

        <h2>Cookies e tecnologias semelhantes</h2>
        <p>Esta página utiliza o Google Tag Manager para organizar as ferramentas de medição, incluindo Google Analytics 4 e Google Ads. Essas ferramentas podem registrar dados técnicos de navegação e eventos de conversão para medir o desempenho da página e das campanhas.</p>
        <p>Você pode aceitar ou recusar os cookies não essenciais no aviso exibido durante a primeira visita e alterar sua escolha a qualquer momento pelo link “Gerenciar cookies”. O primeiro nome e o número de telefone informados no formulário não são enviados ao Google Ads nem ao Google Analytics.</p>

        <h2>Uso das informações</h2>
        <p>Os dados fornecidos voluntariamente são utilizados para responder ao contato e prestar as informações solicitadas. Os dados não serão comercializados.</p>

        <h2>Informações e exclusão de dados</h2>
        <p>Para solicitar informações sobre os dados fornecidos ou pedir sua exclusão, entre em contato pelo WhatsApp (85) 99152-5445.</p>

        <div className="privacyActions"><Link className="privacyBack bottom" href="/">← Retornar à página de psicoterapia</Link><button type="button" className="footerLinkButton privacyManage" data-manage-cookies>Gerenciar cookies</button></div>
      </article>
    </main>
  );
}
