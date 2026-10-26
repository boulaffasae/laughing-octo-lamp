import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
} from "remotion";
import {
  ArrowUpRight,
  CreditCard,
  FileCheck2,
  ShieldCheck,
  X,
  Banknote,
  CarFront,
  Handshake,
  ArrowDown,
} from "lucide-react";

const P = {
  bg: "#102c25",
  cream: "#fbfbf6",
  lime: "#d8f89c",
  coral: "#ff8b74",
  muted: "#b3c8ba",
};
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
function enter(frame: number, delay = 0) {
  return spring({
    fps: 30,
    frame: frame - delay,
    config: { damping: 20, stiffness: 120 },
  });
}
const heading: React.CSSProperties = {
  fontSize: 96,
  fontWeight: 800,
  letterSpacing: -5,
  lineHeight: 1.04,
  margin: "30px 0",
};
const sub: React.CSSProperties = {
  fontSize: 36,
  lineHeight: 1.4,
  letterSpacing: -0.6,
};
function Tag({
  children,
  coral = false,
  light = false,
}: {
  children: React.ReactNode;
  coral?: boolean;
  light?: boolean;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        border: `1px solid ${light ? (coral ? "#b94f3e" : "#356451") : coral ? P.coral : "#718c7b"}`,
        padding: "15px 24px",
        borderRadius: 99,
        fontSize: 24,
        letterSpacing: 2,
        fontWeight: 700,
        color: light
          ? coral
            ? "#b94f3e"
            : "#356451"
          : coral
            ? P.coral
            : P.lime,
        textTransform: "uppercase",
      }}
    >
      {children}
    </div>
  );
}
function Reveal({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}) {
  const f = useCurrentFrame(),
    v = enter(f, delay);
  return (
    <div
      style={{
        opacity: interpolate(f, [delay, delay + 10], [0, 1], clamp),
        transform: `translateY(${(1 - v) * 65}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
function Frame({
  children,
  light = false,
}: {
  children: React.ReactNode;
  light?: boolean;
}) {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: light ? P.cream : P.bg,
        color: light ? P.bg : P.cream,
        padding: "190px 100px 300px",
        overflow: "hidden",
        opacity: interpolate(f, [0, 6], [0, 1], clamp),
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 1000,
          height: 1000,
          borderRadius: "50%",
          border: `1px solid ${light ? "#35645115" : "#d8f89c14"}`,
          top: 630,
          left: 260,
          transform: `rotate(${f / 8}deg) scale(${1 + f / 2000})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 720,
          height: 720,
          borderRadius: "50%",
          background: light ? "#d8f89c38" : "#d8f89c06",
          top: 900,
          left: 470,
        }}
      />
      <div style={{ position: "relative", height: "100%" }}>{children}</div>
    </AbsoluteFill>
  );
}
function Cheque({ cross = false }: { cross?: boolean }) {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        position: "relative",
        marginTop: 80,
        transform: `rotate(${-6 + Math.sin(f / 26) * 2}deg) scale(${0.9 + enter(f, 8) * 0.1})`,
        background: "#f7f3e7",
        color: P.bg,
        borderRadius: 28,
        padding: 42,
        boxShadow: "0 35px 100px #0004",
        height: 370,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 23,
          fontWeight: 700,
          letterSpacing: 3,
        }}
      >
        <span>CHÈQUE</span>
        <Banknote size={38} />
      </div>
      <div style={{ marginTop: 45, fontSize: 29, color: "#6d7a70" }}>
        Payez contre ce chèque
      </div>
      <div
        style={{ borderBottom: "2px solid #b7c0ad", marginTop: 24, height: 32 }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 40,
        }}
      >
        <span style={{ letterSpacing: 9, fontSize: 25 }}>0000 0000 0000</span>
        <span style={{ fontSize: 28, fontStyle: "italic" }}>Signature</span>
      </div>
      {cross && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            transform: `scale(${enter(f, 24)})`,
          }}
        >
          <div
            style={{
              width: 240,
              height: 240,
              borderRadius: "50%",
              background: P.coral,
              color: P.bg,
              display: "grid",
              placeItems: "center",
              boxShadow: "0 12px 60px #0003",
            }}
          >
            <X size={160} strokeWidth={3} />
          </div>
        </div>
      )}
    </div>
  );
}
function Hook() {
  return (
    <Frame>
      <Reveal>
        <Tag coral>Location de voiture · Maroc</Tag>
      </Reveal>
      <Reveal delay={4}>
        <h1 style={heading}>
          « Laissez-nous
          <br />
          juste un
          <br />
          <span style={{ color: P.coral }}>chèque… »</span>
        </h1>
      </Reveal>
      <Reveal delay={14}>
        <p style={{ ...sub, color: P.muted }}>
          Pour la caution ?<br />
          Ce n’est pas anodin.
        </p>
      </Reveal>
      <Cheque cross />
      <Reveal delay={40} style={{ marginTop: 70 }}>
        <div
          style={{
            display: "flex",
            gap: 18,
            alignItems: "center",
            fontSize: 32,
            fontWeight: 700,
            color: P.lime,
          }}
        >
          <ArrowDown size={32} /> Ce que vous devez savoir.
        </div>
      </Reveal>
    </Frame>
  );
}
function Law() {
  return (
    <Frame>
      <Reveal>
        <Tag coral>Chèque de garantie</Tag>
        <h1 style={heading}>
          Une pratique
          <br />
          <span style={{ color: P.coral }}>sanctionnée.</span>
        </h1>
      </Reveal>
      <Reveal delay={9}>
        <p style={sub}>
          Accepter sciemment un chèque
          <br />à conserver en garantie,
          <br />
          sans encaissement immédiat.
        </p>
      </Reveal>
      <Reveal
        delay={20}
        style={{
          marginTop: 55,
          padding: 38,
          border: "1px solid #718c7b",
          borderRadius: 30,
        }}
      >
        <div style={{ fontSize: 25, color: P.muted, letterSpacing: 2 }}>
          POUR CELUI QUI L’ACCEPTE
        </div>
        <div
          style={{
            fontSize: 185,
            fontWeight: 850,
            lineHeight: 1.1,
            letterSpacing: -12,
            color: P.coral,
          }}
        >
          2 %
        </div>
        <div style={{ fontSize: 34 }}>de la valeur du chèque : l’amende.</div>
      </Reveal>
      <Reveal delay={28}>
        <p
          style={{
            fontSize: 24,
            color: P.muted,
            lineHeight: 1.5,
            marginTop: 38,
          }}
        >
          Code de commerce, art. 316 · Loi 71.24
          <br />
          Ministère de la Justice · réforme 2026
        </p>
      </Reveal>
    </Frame>
  );
}
function Blank() {
  const f = useCurrentFrame();
  return (
    <Frame light>
      <Reveal>
        <Tag coral light>
          Le réflexe à garder
        </Tag>
        <h1 style={{ ...heading, fontSize: 106 }}>
          Un chèque
          <br />
          en blanc ?<br />
          <span style={{ color: "#c35642" }}>Jamais.</span>
        </h1>
      </Reveal>
      <div style={{ transform: `translateX(${Math.sin(f / 20) * 6}px)` }}>
        <Cheque cross />
      </div>
      <Reveal delay={22} style={{ marginTop: 70 }}>
        <p style={sub}>
          Ni montant vide.
          <br />
          Ni bénéficiaire manquant.
          <br />
          <strong>Ne signez pas dans le flou.</strong>
        </p>
      </Reveal>
    </Frame>
  );
}
function Alternative() {
  const f = useCurrentFrame();
  return (
    <Frame>
      <Reveal>
        <Tag>Une autre voie</Tag>
        <h1 style={heading}>
          Une caution.
          <br />
          <span style={{ color: P.lime }}>Des règles claires.</span>
        </h1>
      </Reveal>
      <Reveal delay={10} style={{ marginTop: 60 }}>
        <div
          style={{
            height: 350,
            borderRadius: 36,
            padding: 42,
            background: "linear-gradient(135deg,#d8f89c,#9fcf7d)",
            color: P.bg,
            transform: `rotate(${3 - Math.sin(f / 35) * 2}deg)`,
            boxShadow: "0 30px 90px #0004",
          }}
        >
          <CreditCard size={62} />
          <div style={{ fontSize: 43, fontWeight: 700, marginTop: 30 }}>
            Préautorisation bancaire
          </div>
          <div
            style={{
              display: "flex",
              gap: 14,
              alignItems: "center",
              fontSize: 27,
              marginTop: 24,
            }}
          >
            <ShieldCheck /> Montant réservé ≠ montant débité
          </div>
        </div>
      </Reveal>
      <Reveal delay={24}>
        <p style={{ ...sub, marginTop: 65 }}>
          Vérifiez le montant, la carte acceptée
          <br />
          et les conditions de déblocage.
        </p>
        <p style={{ fontSize: 26, color: P.muted, lineHeight: 1.4 }}>
          Selon l’agence et votre banque.
          <br />
          Toutes les cartes ne sont pas acceptées.
        </p>
      </Reveal>
    </Frame>
  );
}
const commitments = [
  {
    Icon: ShieldCheck,
    title: "Sans chèque de garantie",
    detail: "Une politique expliquée avant de réserver.",
  },
  {
    Icon: FileCheck2,
    title: "Contrat transparent",
    detail: "Prix, assurance, franchise et frais écrits.",
  },
  {
    Icon: CreditCard,
    title: "Caution encadrée",
    detail: "Montant et restitution clairement définis.",
  },
];
function Clarity() {
  return (
    <Frame light>
      <Reveal>
        <Tag light>Avant de prendre les clés</Tag>
        <h1 style={{ ...heading, fontSize: 91 }}>
          Exigez mieux.
          <br />
          <span style={{ color: "#356451" }}>Louez plus serein.</span>
        </h1>
      </Reveal>
      <div
        style={{
          marginTop: 62,
          display: "flex",
          flexDirection: "column",
          gap: 26,
        }}
      >
        {commitments.map(({ Icon, title, detail }, i) => (
          <Reveal key={title} delay={12 + i * 10}>
            <div
              style={{
                display: "flex",
                gap: 24,
                alignItems: "center",
                padding: "30px 26px",
                background: "white",
                border: "1px solid #dce5d7",
                borderRadius: 27,
              }}
            >
              <div
                style={{ background: "#eaf2df", borderRadius: 20, padding: 18 }}
              >
                <Icon size={47} color="#356451" />
              </div>
              <div>
                <div
                  style={{ fontSize: 34, fontWeight: 750, letterSpacing: -1 }}
                >
                  {title}
                </div>
                <div
                  style={{
                    fontSize: 25,
                    lineHeight: 1.4,
                    color: "#637468",
                    marginTop: 8,
                  }}
                >
                  {detail}
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={38}>
        <p style={{ fontSize: 29, lineHeight: 1.5, marginTop: 50 }}>
          Une promesse orale ne remplace pas
          <br />
          <strong>des engagements écrits.</strong>
        </p>
      </Reveal>
    </Frame>
  );
}
function Partner() {
  const f = useCurrentFrame();
  return (
    <Frame>
      <Reveal>
        <Tag>Notre engagement</Tag>
        <h1 style={{ ...heading, fontSize: 88 }}>
          Chez Louma,
          <br />
          nous sommes
          <br />
          <span style={{ color: P.lime }}>engagés</span> pour
          <br />
          une location
          <br />
          plus claire.
        </h1>
      </Reveal>
      <Reveal delay={15} style={{ marginTop: 48 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            padding: "32px",
            border: "1px solid #718c7b",
            borderRadius: 30,
            background: "#ffffff06",
          }}
        >
          <div style={{ transform: `rotate(${Math.sin(f / 24) * 4}deg)` }}>
            <ShieldCheck size={100} color={P.lime} />
          </div>
          <div>
            <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: -2 }}>
              Louma Partner
            </div>
            <div style={{ fontSize: 25, color: P.muted, marginTop: 10 }}>
              Un réseau de confiance à construire.
            </div>
          </div>
        </div>
      </Reveal>
      <Reveal delay={30}>
        <p style={{ ...sub, marginTop: 46 }}>
          Notre ambition : vous orienter
          <br />
          vers des agences aux pratiques
          <br />
          <strong style={{ color: P.lime }}>claires et transparentes.</strong>
        </p>
      </Reveal>
    </Frame>
  );
}
function End() {
  const f = useCurrentFrame();
  return (
    <Frame>
      <Reveal>
        <div
          style={{
            width: 150,
            height: 150,
            borderRadius: 36,
            background: P.lime,
            color: P.bg,
            display: "grid",
            placeItems: "center",
            transform: `rotate(${-8 + enter(f) * 8}deg)`,
          }}
        >
          <Handshake size={91} />
        </div>
        <h1 style={{ ...heading, fontSize: 100, marginTop: 42 }}>
          Agences,
          <br />
          construisons
          <br />
          <span style={{ color: P.lime }}>la confiance.</span>
        </h1>
      </Reveal>
      <Reveal delay={12}>
        <p style={sub}>
          Des conditions claires.
          <br />
          Des clients mieux informés.
          <br />
          Une relation qui dure.
        </p>
      </Reveal>
      <Reveal delay={22} style={{ marginTop: 46 }}>
        <div
          style={{
            background: P.lime,
            color: P.bg,
            borderRadius: 24,
            padding: "28px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 34,
            fontWeight: 750,
          }}
        >
          Échangeons sur Louma Partner
          <ArrowUpRight size={46} />
        </div>
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            fontSize: 28,
            marginTop: 32,
            color: P.cream,
          }}
        >
          <CarFront size={32} /> Conducteurs : suivez nos conseils.
        </div>
      </Reveal>
      <Reveal delay={32}>
        <p
          style={{
            fontSize: 23,
            color: P.muted,
            marginTop: 38,
            lineHeight: 1.45,
          }}
        >
          Programme partenaire en préparation.
          <br />
          Label privé envisagé, sans certification publique.
        </p>
      </Reveal>
    </Frame>
  );
}
export function LoumaSansCheque() {
  const f = useCurrentFrame();
  const starts = [0, 135, 330, 480, 675, 855, 1065],
    durations = [135, 195, 150, 195, 180, 210, 195];
  const scenes = [Hook, Law, Blank, Alternative, Clarity, Partner, End];
  const light = (f >= 330 && f < 480) || (f >= 675 && f < 855);
  return (
    <AbsoluteFill
      style={{ fontFamily: "Arial, Helvetica, sans-serif", background: P.bg }}
    >
      <Audio src={staticFile("video/louma-trust-beat.wav")} volume={0.65} />
      {scenes.map((Scene, i) => (
        <Sequence
          key={starts[i]}
          from={starts[i]}
          durationInFrames={durations[i]}
        >
          <Scene />
        </Sequence>
      ))}
      <div
        style={{
          position: "absolute",
          top: 84,
          left: 100,
          right: 140,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: light ? P.bg : P.cream,
        }}
      >
        <div style={{ fontSize: 47, fontWeight: 800, letterSpacing: -3 }}>
          louma<span style={{ color: P.coral }}>.</span>
        </div>
        <div style={{ fontSize: 21, letterSpacing: 3 }}>LE BON RÉFLEXE</div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 100,
          right: 180,
          bottom: 233,
          display: "flex",
          gap: 10,
        }}
      >
        {starts.map((s, i) => (
          <div
            key={s}
            style={{
              height: 5,
              borderRadius: 10,
              background: light ? "#263c3625" : "#ffffff22",
              flex: 1,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                background: light ? "#356451" : P.lime,
                width: `${interpolate(f, [s, s + durations[i]], [0, 100], clamp)}%`,
              }}
            />
          </div>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          left: 100,
          bottom: 177,
          fontSize: 21,
          letterSpacing: 2,
          color: light ? "#637468" : P.muted,
        }}
      >
        LOUMA · LA CONFIANCE PREND LA ROUTE
      </div>
    </AbsoluteFill>
  );
}
