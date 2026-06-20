import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Flame,
  Shield,
  Axe,
  LifeBuoy,
  HeartPulse,
  Siren,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import brasao from "@/assets/brasao.png.asset.json";
import hero from "@/assets/hero-bg.jpg.asset.json";
import g1 from "@/assets/galeria-1.jpg.asset.json";
import g2 from "@/assets/galeria-2.jpg.asset.json";
import g3 from "@/assets/galeria-3.jpg.asset.json";
import g4 from "@/assets/galeria-4.jpg.asset.json";
import g5 from "@/assets/galeria-5.jpg.asset.json";
import g6 from "@/assets/galeria-6.jpg.asset.json";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "3º Grupamento de Bombeiros — Honra, Disciplina e Coragem" },
      {
        name: "description",
        content:
          "Página institucional do 3º Grupamento de Bombeiros: história, missão, serviços de emergência e contato. Servir e proteger é nossa missão.",
      },
      { property: "og:title", content: "3º Grupamento de Bombeiros" },
      {
        property: "og:description",
        content: "Honra, disciplina e coragem a serviço da comunidade.",
      },
      { property: "og:image", content: hero.url },
      { name: "twitter:image", content: hero.url },
    ],
  }),
  component: SobrePage,
});

// ---------- helpers ----------
function useInView<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!ref.current || seen) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && (setSeen(true), io.disconnect()),
      { threshold: 0.15 },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [seen]);
  return { ref, seen };
}

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { ref, seen } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-700 ${
        seen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      {children}
    </div>
  );
}

// ---------- page ----------
function SobrePage() {
  return (
    <div className="min-h-screen bg-[var(--gb-cream)] text-foreground font-sans">
      <SiteHeader />
      <Hero />
      <Historia />
      <Missao />
      <Servicos />
      <Galeria />
      <Contato />
      <SiteFooter />
    </div>
  );
}

// ---------- header ----------
function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 20);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  const nav = [
    { href: "#historia", label: "História" },
    { href: "#missao", label: "Missão" },
    { href: "#servicos", label: "Serviços" },
    { href: "#galeria", label: "Galeria" },
    { href: "#contato", label: "Contato" },
  ];
  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[var(--gb-navy)]/90 backdrop-blur-md shadow-lg border-b border-[var(--gb-gold)]/30"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 sm:h-20 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <a href="#top" className="flex min-w-0 items-center gap-3">
          <img src={brasao.url} alt="Brasão 3º GB" className="h-10 sm:h-12 w-auto shrink-0 drop-shadow" />
          <span className="truncate font-serif text-base sm:text-lg text-white tracking-wide">
            3º Grupamento de Bombeiros
          </span>
        </a>
        <div className="flex items-center gap-1 sm:gap-2">
          <nav className="hidden md:flex items-center gap-1">
            {nav.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="px-3 py-2 text-sm font-medium text-white/85 hover:text-[var(--gb-gold)] transition-colors relative after:content-[''] after:absolute after:left-3 after:right-3 after:bottom-1 after:h-px after:bg-[var(--gb-gold)] after:scale-x-0 hover:after:scale-x-100 after:origin-left after:transition-transform"
              >
                {n.label}
              </a>
            ))}
          </nav>
          <Link
            to="/"
            className="hidden sm:inline-flex items-center gap-2 ml-2 px-4 py-2 rounded-md bg-[var(--gb-gold)] text-[var(--gb-navy)] font-bold text-sm shadow-[var(--shadow-gold)] hover:brightness-110 transition"
          >
            <Shield className="h-4 w-4" /> Controle de Férias
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden p-2 rounded-md text-white hover:bg-white/10"
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden bg-[var(--gb-navy)] border-t border-[var(--gb-gold)]/30 px-4 py-3 space-y-1 animate-in slide-in-from-top-2">
          {nav.map((n) => (
            <a
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-white/90 hover:text-[var(--gb-gold)] text-sm font-medium"
            >
              {n.label}
            </a>
          ))}
          <Link
            to="/"
            className="mt-2 inline-flex w-full items-center justify-center gap-2 px-4 py-2 rounded-md bg-[var(--gb-gold)] text-[var(--gb-navy)] font-bold text-sm"
          >
            <Shield className="h-4 w-4" /> Controle de Férias
          </Link>
        </div>
      )}
    </header>
  );
}

// ---------- hero ----------
function Hero() {
  return (
    <section id="top" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${hero.url})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--gb-navy)]/85 via-[var(--gb-navy)]/70 to-[var(--gb-navy)]/95" />
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_30%,oklch(0.78_0.15_85)_0%,transparent_45%)]" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 py-32 text-center">
        <div className="relative inline-block mb-8 animate-in fade-in zoom-in-50 duration-1000">
          <div className="absolute inset-0 rounded-full blur-3xl bg-[var(--gb-gold)]/40 animate-pulse" />
          <img
            src={brasao.url}
            alt="Brasão do 3º Grupamento de Bombeiros"
            className="relative h-36 sm:h-52 w-auto drop-shadow-[0_8px_30px_rgba(0,0,0,0.7)]"
          />
        </div>

        <div className="inline-flex items-center gap-2 mb-4 text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-[var(--gb-gold)]">
          <span className="h-px w-8 bg-[var(--gb-gold)]" />
          Servir e Proteger
          <span className="h-px w-8 bg-[var(--gb-gold)]" />
        </div>

        <h1 className="font-serif text-5xl sm:text-7xl font-bold text-white leading-tight drop-shadow-2xl">
          3º Grupamento <br />
          <span className="text-[var(--gb-gold)]">de Bombeiros</span>
        </h1>

        <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-white/85 leading-relaxed">
          Honra, disciplina e coragem. Há décadas levando segurança, salvamento e
          esperança aos sertões e cidades do nordeste brasileiro.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <a
            href="#historia"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-[var(--gb-red)] text-white font-bold shadow-[0_10px_30px_-10px_oklch(0.5_0.25_25/0.7)] hover:brightness-110 hover:-translate-y-0.5 transition-all border border-[var(--gb-gold)]/40"
          >
            Conheça nossa história <ChevronRight className="h-4 w-4" />
          </a>
          <a
            href="tel:193"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-transparent text-[var(--gb-gold)] font-bold border-2 border-[var(--gb-gold)] hover:bg-[var(--gb-gold)] hover:text-[var(--gb-navy)] transition-colors"
          >
            <Siren className="h-4 w-4" /> Emergência 193
          </a>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-xs animate-bounce">
        ▼
      </div>
    </section>
  );
}

// ---------- historia ----------
function Historia() {
  return (
    <section id="historia" className="py-24 sm:py-32 bg-[var(--gb-cream)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 grid md:grid-cols-2 gap-12 items-center">
        <Reveal>
          <SectionTag>Nossa História</SectionTag>
          <h2 className="mt-3 font-serif text-4xl sm:text-5xl font-bold text-[var(--gb-navy)] leading-tight">
            Tradição forjada no fogo e no compromisso
          </h2>
          <div className="my-6 h-1 w-20 bg-[var(--gb-gold)]" />
          <p className="text-base sm:text-lg text-foreground/80 leading-relaxed">
            Há gerações o 3º Grupamento de Bombeiros mantém a chama da coragem
            acesa, protegendo vidas, patrimônio e a memória do povo nordestino.
            Cada operação reflete décadas de treinamento, doutrina e respeito ao
            uniforme.
          </p>
          <p className="mt-4 text-base text-foreground/70 leading-relaxed">
            Da prevenção ao combate, do salvamento à educação comunitária, nossa
            corporação carrega a tradição militar com o olhar voltado ao futuro
            — modernizando equipamentos, técnicas e protocolos sem nunca perder
            de vista quem mais importa: o cidadão.
          </p>
        </Reveal>
        <Reveal className="md:order-last">
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-[var(--gb-gold)]/40">
            <img
              src={g2.url}
              alt="Bombeiros em formação"
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--gb-navy)]/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <div className="text-[10px] uppercase tracking-[0.3em] text-[var(--gb-gold)] font-bold">
                Tropa
              </div>
              <div className="font-serif text-2xl mt-1">Disciplina em formação</div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ---------- missão ----------
function Missao() {
  const items = [
    {
      icon: Shield,
      title: "Missão",
      text: "Proteger vidas, o patrimônio e o meio ambiente com excelência operacional e respeito ao próximo.",
    },
    {
      icon: Flame,
      title: "Visão",
      text: "Ser referência regional em prontidão, salvamento e ação preventiva, integrando comunidade e tecnologia.",
    },
    {
      icon: Axe,
      title: "Valores",
      text: "Honra, disciplina, coragem, lealdade e espírito de corpo — pilares que sustentam cada guarnição.",
    },
  ];
  return (
    <section id="missao" className="py-24 sm:py-32 bg-[var(--gb-navy)] text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_20%,oklch(0.78_0.15_85),transparent_45%),radial-gradient(circle_at_80%_80%,oklch(0.5_0.25_25),transparent_45%)]" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="text-center max-w-2xl mx-auto">
          <SectionTag tone="dark">Pilares</SectionTag>
          <h2 className="mt-3 font-serif text-4xl sm:text-5xl font-bold leading-tight">
            Missão, Visão e Valores
          </h2>
          <div className="mx-auto my-6 h-1 w-20 bg-[var(--gb-gold)]" />
          <p className="text-white/70">
            Princípios que regem cada saída de viatura e cada decisão tomada no
            calor da operação.
          </p>
        </Reveal>
        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {items.map((it, i) => (
            <Reveal key={it.title} className={`[transition-delay:${i * 100}ms]`}>
              <div className="group h-full rounded-2xl bg-white/5 backdrop-blur border border-white/10 p-8 hover:border-[var(--gb-gold)]/60 hover:-translate-y-1 hover:shadow-[var(--shadow-gold)] transition-all">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--gb-gold)] text-[var(--gb-navy)] shadow-lg">
                  <it.icon className="h-7 w-7" />
                </div>
                <h3 className="mt-5 font-serif text-2xl font-bold text-white">
                  {it.title}
                </h3>
                <p className="mt-2 text-white/75 leading-relaxed">{it.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- serviços ----------
function Servicos() {
  const items = [
    { icon: Flame, title: "Combate a Incêndio", text: "Resposta rápida a incêndios urbanos, florestais e veiculares com equipes especializadas." },
    { icon: LifeBuoy, title: "Salvamento Aquático", text: "Resgate em rios, açudes e represas, com guarnições treinadas e embarcações próprias." },
    { icon: HeartPulse, title: "Atendimento Pré-Hospitalar", text: "Suporte básico de vida no local da ocorrência até a chegada ao hospital." },
    { icon: Axe, title: "Resgate Veicular", text: "Desencarceramento e estabilização de vítimas em colisões e acidentes complexos." },
    { icon: Shield, title: "Prevenção e Vistoria", text: "Inspeções técnicas, projetos preventivos e treinamentos para empresas e escolas." },
    { icon: Siren, title: "Defesa Civil", text: "Atuação em desastres naturais, enchentes, deslizamentos e ações comunitárias." },
  ];
  return (
    <section id="servicos" className="py-24 sm:py-32 bg-[var(--gb-cream)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="text-center max-w-2xl mx-auto">
          <SectionTag>O que fazemos</SectionTag>
          <h2 className="mt-3 font-serif text-4xl sm:text-5xl font-bold text-[var(--gb-navy)]">
            Nossos Serviços
          </h2>
          <div className="mx-auto my-6 h-1 w-20 bg-[var(--gb-gold)]" />
          <p className="text-foreground/70">
            Prontidão integral em todas as frentes que envolvem segurança e
            preservação da vida.
          </p>
        </Reveal>
        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((it) => (
            <Reveal key={it.title}>
              <div className="group h-full rounded-2xl bg-white p-7 border border-[var(--gb-navy)]/10 hover:border-[var(--gb-red)]/40 hover:-translate-y-1 hover:shadow-xl transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 h-24 w-24 bg-[var(--gb-red)]/5 rounded-full blur-2xl group-hover:bg-[var(--gb-red)]/15 transition" />
                <div className="relative inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--gb-red)] to-[oklch(0.42_0.22_25)] text-white shadow-md ring-2 ring-[var(--gb-gold)]/40">
                  <it.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-serif text-xl font-bold text-[var(--gb-navy)]">
                  {it.title}
                </h3>
                <p className="mt-2 text-sm text-foreground/70 leading-relaxed">{it.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- galeria ----------
function Galeria() {
  const imgs = [
    { src: g1.url, alt: "Viatura do 3º GB", span: "sm:col-span-2 sm:row-span-2" },
    { src: g3.url, alt: "Treinamento de combate a incêndio" },
    { src: g6.url, alt: "Capacete e machado" },
    { src: g4.url, alt: "Embarcação de salvamento" },
    { src: g5.url, alt: "Operação aérea com drone" },
  ];
  return (
    <section id="galeria" className="py-24 sm:py-32 bg-[var(--gb-navy)] text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="text-center max-w-2xl mx-auto">
          <SectionTag tone="dark">Imagens</SectionTag>
          <h2 className="mt-3 font-serif text-4xl sm:text-5xl font-bold">Galeria</h2>
          <div className="mx-auto my-6 h-1 w-20 bg-[var(--gb-gold)]" />
          <p className="text-white/70">A rotina, a tropa e os instrumentos que salvam vidas.</p>
        </Reveal>
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 auto-rows-[180px] sm:auto-rows-[220px] gap-3 sm:gap-4">
          {imgs.map((im, i) => (
            <Reveal
              key={i}
              className={`group relative overflow-hidden rounded-xl ring-1 ring-white/10 hover:ring-[var(--gb-gold)]/60 transition ${im.span ?? ""}`}
            >
              <img
                src={im.src}
                alt={im.alt}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--gb-navy)]/80 via-transparent opacity-80 group-hover:opacity-60 transition" />
              <div className="absolute bottom-3 left-3 right-3 text-xs sm:text-sm font-medium text-white drop-shadow">
                {im.alt}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- contato ----------
function Contato() {
  return (
    <section id="contato" className="py-24 sm:py-32 bg-[var(--gb-cream)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 grid md:grid-cols-2 gap-12">
        <Reveal>
          <SectionTag>Fale conosco</SectionTag>
          <h2 className="mt-3 font-serif text-4xl sm:text-5xl font-bold text-[var(--gb-navy)]">
            Contato e Emergências
          </h2>
          <div className="my-6 h-1 w-20 bg-[var(--gb-gold)]" />
          <p className="text-foreground/70 max-w-md">
            Em situações de emergência, ligue imediatamente. Para informações
            gerais, projetos preventivos ou visitas, utilize os canais abaixo.
          </p>

          <div className="mt-8 space-y-4">
            <InfoLine icon={Siren} label="Emergência" value="193" highlight />
            <InfoLine icon={Phone} label="Administrativo" value="(00) 0000-0000" />
            <InfoLine icon={Mail} label="E-mail" value="contato@3gb.bombeiros.gov.br" />
            <InfoLine icon={MapPin} label="Quartel" value="Av. dos Bombeiros, s/n — Centro" />
          </div>
        </Reveal>

        <Reveal>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="rounded-2xl bg-white border border-[var(--gb-navy)]/10 p-7 shadow-xl space_y-4 space-y-4"
          >
            <h3 className="font-serif text-2xl font-bold text-[var(--gb-navy)]">
              Envie uma mensagem
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Nome" placeholder="Seu nome" />
              <Field label="Telefone" placeholder="(00) 00000-0000" />
            </div>
            <Field label="E-mail" placeholder="voce@email.com" type="email" />
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--gb-navy)]/70">
                Mensagem
              </label>
              <textarea
                rows={4}
                placeholder="Como podemos ajudar?"
                className="mt-1 w-full rounded-md border border-[var(--gb-navy)]/15 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gb-red)]/40"
              />
            </div>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-[var(--gb-red)] text-white font-bold hover:brightness-110 transition border border-[var(--gb-gold)]/40 shadow-[var(--shadow-gold)]"
            >
              <Shield className="h-4 w-4" /> Enviar mensagem
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}

function Field({
  label,
  ...rest
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wider text-[var(--gb-navy)]/70">
        {label}
      </label>
      <input
        {...rest}
        className="mt-1 w-full rounded-md border border-[var(--gb-navy)]/15 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gb-red)]/40"
      />
    </div>
  );
}

function InfoLine({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: typeof Phone;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-xl border ${
        highlight
          ? "bg-[var(--gb-red)] text-white border-[var(--gb-gold)]/50 shadow-[var(--shadow-gold)]"
          : "bg-white border-[var(--gb-navy)]/10"
      }`}
    >
      <div
        className={`h-11 w-11 grid place-items-center rounded-lg shrink-0 ${
          highlight ? "bg-white/15" : "bg-[var(--gb-navy)] text-[var(--gb-gold)]"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className={`text-[10px] uppercase tracking-[0.2em] font-bold ${highlight ? "text-[var(--gb-gold)]" : "text-[var(--gb-navy)]/60"}`}>
          {label}
        </div>
        <div className={`font-serif text-xl ${highlight ? "text-white" : "text-[var(--gb-navy)]"}`}>
          {value}
        </div>
      </div>
    </div>
  );
}

// ---------- footer ----------
function SiteFooter() {
  return (
    <footer className="bg-[oklch(0.15_0.04_25)] text-white/80 py-12 border-t-4 border-[var(--gb-gold)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 grid sm:grid-cols-[auto_1fr_auto] gap-6 items-center">
        <img src={brasao.url} alt="Brasão 3º GB" className="h-16 w-auto" />
        <div className="text-center sm:text-left">
          <div className="font-serif text-xl text-white">3º Grupamento de Bombeiros</div>
          <div className="text-xs uppercase tracking-[0.25em] text-[var(--gb-gold)] mt-1">
            Honra • Disciplina • Coragem
          </div>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-[var(--gb-gold)]/40 text-[var(--gb-gold)] text-sm font-bold hover:bg-[var(--gb-gold)] hover:text-[var(--gb-navy)] transition"
        >
          <Shield className="h-4 w-4" /> Controle de Férias
        </Link>
      </div>
      <div className="mt-8 text-center text-xs text-white/40">
        © {new Date().getFullYear()} 3º Grupamento de Bombeiros. Todos os direitos reservados.
      </div>
    </footer>
  );
}

// ---------- shared ----------
function SectionTag({ children, tone = "light" }: { children: React.ReactNode; tone?: "light" | "dark" }) {
  return (
    <span
      className={`inline-flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] ${
        tone === "dark" ? "text-[var(--gb-gold)]" : "text-[var(--gb-red)]"
      }`}
    >
      <span className={`h-px w-6 ${tone === "dark" ? "bg-[var(--gb-gold)]" : "bg-[var(--gb-red)]"}`} />
      {children}
    </span>
  );
}
