"use client";

import { usePathname, useSearchParams } from "next/navigation";
import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { gsap } from "gsap";
import { Check, Info, PencilLine, TriangleAlert, X } from "lucide-react";

export type NoticeTone = "success" | "error" | "warning" | "info";

export type SiteNotice = {
  tone: NoticeTone;
  title: string;
  message: string;
  duration?: number;
};

type QueuedNotice = SiteNotice & { id: number; order: number };
type FeedbackState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[] | undefined>;
};

const NoticeContext = createContext<((notice: SiteNotice) => void) | null>(null);

const urlNotices: Record<string, SiteNotice> = {
  "aviso:conta-criada-aluno": {
    tone: "success",
    title: "Conta criada com sucesso",
    message: "Seu espaço está pronto. Já pode procurar profissionais e guardar seus favoritos.",
    duration: 7600,
  },
  "aviso:conta-criada-personal": {
    tone: "success",
    title: "Conta criada com sucesso",
    message: "Seu acesso está pronto. Agora falta montar o perfil que as pessoas vão encontrar.",
    duration: 7600,
  },
  "aviso:entrada-confirmada": {
    tone: "success",
    title: "Você entrou",
    message: "A sessão está ativa. Pode continuar de onde parou.",
  },
  "aviso:sessao-encerrada": {
    tone: "info",
    title: "Sessão encerrada",
    message: "Seu acesso foi fechado com segurança neste navegador.",
  },
  "conta:excluida": {
    tone: "info",
    title: "Conta excluída",
    message: "Os dados e o acesso dessa conta foram removidos.",
    duration: 7600,
  },
  "senha:alterada": {
    tone: "success",
    title: "Senha atualizada",
    message: "A nova senha já está valendo. Entre novamente para continuar.",
    duration: 7600,
  },
  "erro:confirmacao": {
    tone: "error",
    title: "Link fora de validade",
    message: "Esse link expirou ou já foi usado. Tente entrar ou solicite um novo acesso.",
    duration: 9000,
  },
  "contato:indisponivel": {
    tone: "warning",
    title: "Contato indisponível",
    message: "Este profissional ainda não liberou esse canal. Tente outra forma de contato.",
    duration: 7600,
  },
};

export function SiteNoticeProvider({ children }: { children: React.ReactNode }) {
  const [notices, setNotices] = useState<QueuedNotice[]>([]);
  const sequence = useRef(0);

  const notify = useCallback((notice: SiteNotice) => {
    sequence.current += 1;
    const queued = { ...notice, id: Date.now() + sequence.current, order: sequence.current };
    setNotices((current) => [...current.slice(-2), queued]);
  }, []);

  const remove = useCallback((id: number) => {
    setNotices((current) => current.filter((notice) => notice.id !== id));
  }, []);

  return (
    <NoticeContext.Provider value={notify}>
      {children}
      <Suspense fallback={null}><UrlNoticeReader notify={notify} /></Suspense>
      <section className="site-notice-rail" aria-label="Avisos recentes">
        {notices.map((notice) => <NoticeCard key={notice.id} notice={notice} onRemove={remove} />)}
      </section>
    </NoticeContext.Provider>
  );
}

export function useSiteNotice() {
  const notify = useContext(NoticeContext);
  if (!notify) throw new Error("useSiteNotice deve ser usado dentro de SiteNoticeProvider.");
  return notify;
}

export function useActionNotice(
  state: FeedbackState,
  {
    successTitle,
    errorTitle = "Não foi dessa vez",
    validationTitle = "Dá uma olhada nos campos",
  }: {
    successTitle: string;
    errorTitle?: string;
    validationTitle?: string;
  },
) {
  const notify = useSiteNotice();
  const lastState = useRef<FeedbackState>(state);

  useEffect(() => {
    if (lastState.current === state) return;
    lastState.current = state;

    if (state.message) {
      notify({
        tone: state.success ? "success" : "error",
        title: state.success ? successTitle : errorTitle,
        message: state.message,
        duration: state.success ? 7200 : 9000,
      });
      return;
    }

    if (state.errors && Object.values(state.errors).some((messages) => Boolean(messages?.length))) {
      notify({
        tone: "warning",
        title: validationTitle,
        message: "Há informações que precisam de ajuste antes de continuar.",
        duration: 7200,
      });
    }
  }, [errorTitle, notify, state, successTitle, validationTitle]);
}

function UrlNoticeReader({ notify }: { notify: (notice: SiteNotice) => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const serializedParams = searchParams.toString();
  const lastReadUrl = useRef("");

  useEffect(() => {
    const currentUrl = `${pathname}?${serializedParams}`;
    if (lastReadUrl.current === currentUrl) return;
    lastReadUrl.current = currentUrl;

    const url = new URL(window.location.href);
    const consumedKeys = new Set<string>();
    for (const key of ["aviso", "conta", "senha", "erro", "contato"]) {
      const value = url.searchParams.get(key);
      const notice = value ? urlNotices[`${key}:${value}`] : undefined;
      if (notice) {
        notify(notice);
        consumedKeys.add(key);
      }
    }

    if (consumedKeys.size) {
      consumedKeys.forEach((key) => url.searchParams.delete(key));
      window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
    }
  }, [notify, pathname, serializedParams]);

  return null;
}

function NoticeCard({ notice, onRemove }: { notice: QueuedNotice; onRemove: (id: number) => void }) {
  const cardRef = useRef<HTMLElement>(null);
  const closing = useRef(false);
  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    const card = cardRef.current;
    if (!card || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onRemove(notice.id);
      return;
    }
    gsap.to(card, {
      x: 34,
      autoAlpha: 0,
      rotate: 0.8,
      duration: 0.24,
      ease: "power2.in",
      onComplete: () => onRemove(notice.id),
    });
  }, [notice.id, onRemove]);

  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(
      card,
      { x: 44, autoAlpha: 0, rotate: 1.4, clipPath: "inset(0 0 0 100%)" },
      { x: 0, autoAlpha: 1, rotate: 0, clipPath: "inset(0 0 0 0%)", duration: 0.48, ease: "power3.out", clearProps: "clipPath" },
    );
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(close, notice.duration ?? 6200);
    return () => window.clearTimeout(timeout);
  }, [close, notice.duration]);

  const Icon = notice.tone === "success"
    ? Check
    : notice.tone === "error"
      ? TriangleAlert
      : notice.tone === "warning"
        ? PencilLine
        : Info;
  const label = notice.tone === "success" ? "Tudo certo" : notice.tone === "error" ? "Atenção" : notice.tone === "warning" ? "Vale revisar" : "Recado";

  return (
    <article
      ref={cardRef}
      className="site-notice"
      data-tone={notice.tone}
      role={notice.tone === "error" ? "alert" : "status"}
      aria-live={notice.tone === "error" ? "assertive" : "polite"}
      aria-atomic="true"
    >
      <span className="site-notice-mark" aria-hidden="true"><Icon size={19} strokeWidth={2.2} /></span>
      <div className="site-notice-copy">
        <span className="site-notice-kicker">{label} · {String(notice.order).padStart(2, "0")}</span>
        <strong>{notice.title}</strong>
        <p>{notice.message}</p>
      </div>
      <button type="button" onClick={close} aria-label="Fechar aviso"><X size={17} /></button>
      <span className="site-notice-rule" aria-hidden="true" />
    </article>
  );
}
