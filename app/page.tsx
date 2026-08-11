import WhatsAppLink from "./components/WhatsAppLink";

export default function Home() {
  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#inicio" aria-label="Alcyanne Gouveia — início">
          <span>AG</span>
          <div>
            <strong>Alcyanne Gouveia</strong>
            <small>Psicóloga · CRP 11/15040</small>
          </div>
        </a>
        <nav aria-label="Navegação principal">
          <a href="#psicoterapia">Psicoterapia</a>
          <a href="#sobre">Sobre</a>
          <a href="#duvidas">Dúvidas</a>
        </nav>
        <WhatsAppLink className="headerCta" location="header" label="Ver horários disponíveis" />
      </header>

      <section className="hero" id="inicio">
        <div className="heroCopy">
          <p className="eyebrow"><i /> Psicoterapia online e presencial em Fortaleza</p>
          <h1>
            Psicoterapia em Fortaleza para <em>cuidar de você</em> e viver com mais leveza.
          </h1>
          <p className="lead">
            A psicoterapia pode ajudar você a compreender suas emoções, enfrentar
            momentos difíceis e construir novas formas de se relacionar consigo e
            com o mundo.
          </p>
          <div className="heroActions">
            <WhatsAppLink className="primary" location="hero" label="Quero conhecer os horários" />
            <a className="textLink" href="#como-funciona">Como funciona <span>↓</span></a>
          </div>
          <div className="trustRow">
            <span>✓ Atendimento sigiloso</span>
            <span>✓ Online ou presencial</span>
            <span>✓ Sessões de 50 minutos</span>
          </div>
        </div>
        <div className="heroVisual">
          <div className="photoFrame">
            <img
              src="/images/alcyanne-gouveia-psicoterapia-hero.webp"
              alt="Alcyanne Gouveia, psicóloga clínica"
              width="1024"
              height="683"
              fetchPriority="high"
            />
          </div>
          <div className="availability">
            <span className="pulse" />
            <p><strong>Atendimentos disponíveis</strong><small>Online e em Fortaleza</small></p>
          </div>
          <div className="circleText">ESCUTA · ACOLHIMENTO · CUIDADO ·</div>
        </div>
      </section>

      <section className="marquee" aria-label="Áreas em que a psicoterapia pode ajudar">
        <div>ANSIEDADE <b>✦</b> DEPRESSÃO <b>✦</b> RELACIONAMENTOS <b>✦</b> AUTOCONHECIMENTO <b>✦</b> MUDANÇAS DE VIDA</div>
      </section>

      <section className="support section" id="psicoterapia">
        <div className="sectionIntro">
          <p className="eyebrow"><i /> Quando buscar ajuda</p>
          <h2>Você não precisa lidar com tudo <em>sozinho.</em></h2>
        </div>
        <p className="introText">
          Pedir ajuda é um gesto de cuidado. A psicoterapia oferece um espaço
          seguro para falar, elaborar experiências e encontrar caminhos possíveis.
        </p>
        <div className="cards">
          {[
            ["01", "Ansiedade e depressão", "Quando preocupações, tristeza ou desânimo começam a ocupar espaço demais na rotina."],
            ["02", "Conflitos e relações", "Para compreender dificuldades afetivas, familiares ou profissionais que se repetem."],
            ["03", "Momentos de mudança", "Apoio diante de perdas, separações, escolhas, crises e novas fases da vida."],
            ["04", "Autoconhecimento", "Para reconhecer necessidades, limites e construir uma relação mais gentil consigo."],
          ].map(([n, title, text]) => (
            <article className="supportCard" key={n}>
              <span>{n}</span><h3>{title}</h3><p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="process section" id="como-funciona">
        <div className="processPanel">
          <p className="eyebrow light"><i /> Como funciona</p>
          <h2>Um processo construído no <em>seu tempo.</em></h2>
          <p>
            Os encontros acontecem semanalmente, em um horário combinado, e duram
            cerca de 50 minutos. Na primeira conversa, você poderá contar o que está
            vivendo, conhecer meu trabalho e tirar suas dúvidas.
          </p>
          <WhatsAppLink className="creamButton" location="como-funciona" label="Conhecer horários disponíveis" />
        </div>
        <ol className="steps">
          <li><span>01</span><div><h3>Primeiro contato</h3><p>Você envia uma mensagem e verificamos juntos a modalidade e os horários disponíveis.</p></div></li>
          <li><span>02</span><div><h3>Conversa inicial</h3><p>Um primeiro encontro para compreender sua demanda e alinhar expectativas sobre o cuidado.</p></div></li>
          <li><span>03</span><div><h3>Acompanhamento</h3><p>Sessões regulares, com escuta profissional, acolhimento e respeito ao sigilo profissional.</p></div></li>
        </ol>
      </section>

      <section className="about section" id="sobre">
        <div className="aboutPhoto">
          <img
            src="/images/alcyanne-gouveia-consultorio.webp"
            alt="Psicóloga Alcyanne Gouveia em seu consultório"
            width="683"
            height="1024"
            loading="lazy"
          />
          <div className="experience"><strong>CRP</strong><span>11/15040</span></div>
        </div>
        <div className="aboutCopy">
          <p className="eyebrow"><i /> Sobre mim</p>
          <h2>Olá, sou<br/><em>Alcyanne Gouveia.</em></h2>
          <p>
            Sou psicóloga graduada pela Universidade de Fortaleza — UNIFOR, com
            pós-graduação em Transtornos Alimentares pela PUC-RJ e em Psicopatologia,
            Psicanálise e Clínica Contemporânea pelo Instituto ESPE.
          </p>
          <p>
            Acredito na potência de uma escuta ética, sensível e comprometida com a
            história singular de cada pessoa. Atendo crianças, adolescentes, adultos
            e idosos, em português e espanhol.
          </p>
          <div className="credentials">
            <span>Psicologia Clínica</span><span>Atendimento em espanhol</span><span>Online e presencial</span>
          </div>
        </div>
      </section>

      <section className="modalities section" id="modalidades">
        <div className="sectionIntro">
          <p className="eyebrow"><i /> Escolha como cuidar de você</p>
          <h2>Atendimento onde você se sentir <em>mais à vontade.</em></h2>
        </div>
        <div className="modeGrid">
          <article><span>⌂</span><h3>Psicoterapia presencial</h3><p>Consultórios em localizações acessíveis de Fortaleza, com ambiente reservado e acolhedor.</p><small>Aldeota · Edson Queiroz</small></article>
          <article><span>◉</span><h3>Psicoterapia online</h3><p>O mesmo cuidado e sigilo, com a praticidade de realizar as sessões de onde você estiver.</p><small>Para todo o Brasil e exterior</small></article>
        </div>
      </section>

      <section className="faq section" id="duvidas">
        <div className="faqTitle">
          <p className="eyebrow"><i /> Dúvidas frequentes</p>
          <h2>Antes de começar, é natural ter <em>perguntas.</em></h2>
          <p>Se sua dúvida não estiver aqui, pode me chamar. Ficarei feliz em conversar com você.</p>
        </div>
        <div className="faqList">
          <details open><summary>Quando devo procurar psicoterapia?<span>＋</span></summary><p>Quando perceber que está difícil lidar sozinho com suas emoções, relações ou decisões. Você não precisa esperar o sofrimento se tornar insuportável para buscar ajuda.</p></details>
          <details><summary>Como é a primeira sessão?<span>＋</span></summary><p>É um encontro para você contar o que motivou sua busca, conhecer minha forma de trabalho e avaliar se se sente confortável para iniciar o acompanhamento.</p></details>
          <details><summary>A terapia online funciona?<span>＋</span></summary><p>Sim. O atendimento online oferece escuta, privacidade e continuidade do cuidado, desde que você esteja em um ambiente reservado e com conexão estável.</p></details>
          <details><summary>Quanto tempo dura cada sessão?<span>＋</span></summary><p>As sessões duram aproximadamente 50 minutos e, em geral, acontecem uma vez por semana, conforme a necessidade de cada pessoa.</p></details>
          <details><summary>Preciso ter um diagnóstico para procurar psicoterapia?<span>＋</span></summary><p>Não. A psicoterapia também pode ser procurada por pessoas que desejam compreender melhor suas emoções, relações, escolhas ou momentos de mudança, mesmo sem um diagnóstico.</p></details>
          <details><summary>Onde acontece o atendimento presencial?<span>＋</span></summary><p>Os atendimentos presenciais acontecem em Fortaleza, com opções na Aldeota e em Edson Queiroz. No primeiro contato, você poderá verificar a localização e os horários disponíveis.</p></details>
        </div>
      </section>

      <section className="finalCta" id="contato">
        <p className="eyebrow light"><i /> Seu cuidado pode começar hoje</p>
        <h2>Vamos conversar sobre o que você está vivendo?</h2>
        <p>Envie uma mensagem para conhecer os horários disponíveis e tirar suas dúvidas.</p>
        <WhatsAppLink className="creamButton" location="cta-final" label="Conhecer horários disponíveis" />
      </section>

      <footer>
        <a className="brand footerBrand" href="#inicio"><span>AG</span><div><strong>Alcyanne Gouveia</strong><small>Psicóloga · CRP 11/15040</small></div></a>
        <p>Psicoterapia online e presencial em Fortaleza.<br/><strong>WhatsApp: (85) 99152-5445</strong></p>
        <div><a href="#sobre">Sobre</a><a href="#psicoterapia">Psicoterapia</a><a href="#duvidas">Dúvidas</a><a href="/politica-de-privacidade">Política de Privacidade</a></div>
        <small>© 2026 Alcyanne Gouveia. Todos os direitos reservados.</small>
      </footer>

      <WhatsAppLink className="floating" location="flutuante" label="" icon="whatsapp" ariaLabel="Falar com Alcyanne pelo WhatsApp" />
    </main>
  );
}
