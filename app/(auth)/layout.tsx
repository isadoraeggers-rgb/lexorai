import { Logo } from "@/components/brand/logo";

const HIGHLIGHTS = [
  { title: "Second Brain", body: "Sua IA lembra de cada decisão, estratégia e preferência de cliente." },
  { title: "Agentes Jurídicos", body: "Controladoria, redação de petições, análise de risco e mais — automáticos." },
  { title: "Tudo em um só lugar", body: "Clientes, processos, prazos, audiências, documentos e IA, unificados." },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col justify-between p-8 lg:p-12">
        <Logo />
        <div className="mx-auto w-full max-w-sm">{children}</div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Lexora. Legal Operating System.
        </p>
      </div>
      <div className="relative hidden overflow-hidden bg-[#111111] lg:flex lg:flex-col lg:justify-center lg:gap-10 lg:p-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(37,99,235,0.35), transparent 40%), radial-gradient(circle at 80% 70%, rgba(37,99,235,0.25), transparent 45%)",
          }}
        />
        <div className="relative z-10 space-y-10">
          <h2 className="max-w-md text-3xl font-semibold text-[#fafafa]">
            O segundo cérebro do advogado moderno.
          </h2>
          <div className="space-y-6">
            {HIGHLIGHTS.map((h) => (
              <div key={h.title} className="max-w-sm border-l-2 border-accent pl-4">
                <p className="text-sm font-medium text-[#fafafa]">{h.title}</p>
                <p className="text-sm text-[#fafafa]/60">{h.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
