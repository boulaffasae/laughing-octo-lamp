import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  Check,
  ArrowUpRight,
  FileText,
  ScanLine,
  Car,
  CreditCard,
  Download,
  Sparkles,
} from "lucide-react";

const C = {
  cream: "#fbfbf6",
  ink: "#263c36",
  green: "#356451",
  coral: "#e77b61",
  muted: "#7a827d",
};
const ease = (f: number, start = 0) =>
  spring({
    frame: f - start,
    fps: 30,
    config: { damping: 18, stiffness: 100 },
  });
const title: React.CSSProperties = {
  fontSize: 88,
  lineHeight: 1.04,
  letterSpacing: -4,
  fontWeight: 800,
  margin: "28px 0",
};
const small: React.CSSProperties = {
  fontSize: 25,
  letterSpacing: 3,
  fontWeight: 700,
  textTransform: "uppercase",
};
const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: 32,
  padding: 36,
  boxShadow: "0 24px 70px #263c3612",
  border: "2px solid #e8e9e3",
};

function Brand() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        fontSize: 47,
        fontWeight: 800,
        letterSpacing: -2,
      }}
    >
      <span
        style={{
          display: "block",
          width: 26,
          height: 38,
          background: C.coral,
          transform: "skew(-20deg)",
          borderRadius: 5,
        }}
      />
      louma<span style={{ color: C.coral }}>.</span>
    </div>
  );
}
function Pill({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        background: "#edf1e8",
        borderRadius: 50,
        padding: "16px 24px",
        fontSize: 25,
        color: C.green,
        fontWeight: 600,
      }}
    >
      {children}
    </div>
  );
}
function Scene({
  children,
  dark = false,
}: {
  children: React.ReactNode;
  dark?: boolean;
}) {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: dark ? C.ink : C.cream,
        color: dark ? C.cream : C.ink,
        padding: "170px 95px 300px",
        opacity: interpolate(f, [0, 10], [0, 1], { extrapolateRight: "clamp" }),
        transform: `translateY(${(1 - ease(f)) * 40}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
}
function Phone({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        ...card,
        width: 650,
        margin: "40px auto 0",
        padding: 20,
        borderRadius: 64,
        border: "9px solid #263c36",
        boxShadow: "0 36px 90px #263c3620",
        transform: "rotate(-2deg)",
      }}
    >
      <div
        style={{
          width: 150,
          height: 24,
          background: C.ink,
          borderRadius: 30,
          margin: "0 auto 22px",
        }}
      />
      <div style={{ padding: "10px 26px 32px" }}>
        <div style={{ fontWeight: 800, fontSize: 29, marginBottom: 28 }}>
          louma<span style={{ color: C.coral }}>.</span>
        </div>
        {children}
      </div>
    </div>
  );
}
function Hook() {
  const f = useCurrentFrame();
  return (
    <Scene>
      <Brand />
      <div style={{ ...small, marginTop: 95, color: C.green }}>
        Agences de location au Maroc
      </div>
      <h1 style={title}>
        Encore tout
        <br />
        saisir <span style={{ color: C.coral }}>à la main ?</span>
      </h1>
      <p style={{ fontSize: 34, lineHeight: 1.45, maxWidth: 750 }}>
        Vos clients attendent.
        <br />
        La paperasse peut attendre moins.
      </p>
      <div style={{ position: "relative", height: 570, marginTop: 50 }}>
        {["CNIE", "Permis de conduire", "Carte grise"].map((x, i) => (
          <div
            key={x}
            style={{
              ...card,
              position: "absolute",
              top: i * 133,
              left: 25 + i * 28,
              width: 720,
              display: "flex",
              alignItems: "center",
              gap: 30,
              transform: `translateX(${(1 - ease(f, 15 + i * 8)) * 450}px) rotate(${i % 2 ? 3 : -3}deg)`,
            }}
          >
            <FileText size={57} color={C.coral} />
            <div style={{ fontSize: 31, fontWeight: 700 }}>
              {x}
              <div
                style={{
                  height: 9,
                  width: 300,
                  background: "#edf0e8",
                  marginTop: 18,
                  borderRadius: 5,
                }}
              />
            </div>
            <span style={{ marginLeft: "auto", fontSize: 42, color: C.muted }}>
              …
            </span>
          </div>
        ))}
      </div>
      <Pill>Moins de saisie. Plus de route.</Pill>
    </Scene>
  );
}
function Upload() {
  const f = useCurrentFrame();
  return (
    <Scene>
      <Brand />
      <div style={{ ...small, marginTop: 70, color: C.coral }}>
        01 / Ajoutez
      </div>
      <h1 style={title}>
        3 documents.
        <br />
        Un seul réflexe.
      </h1>
      <p style={{ fontSize: 34 }}>Une photo ou un fichier suffit.</p>
      <Phone>
        <div style={{ fontSize: 33, fontWeight: 700, marginBottom: 14 }}>
          Nouveau contrat
        </div>
        <div style={{ fontSize: 23, color: C.muted, marginBottom: 30 }}>
          Ajoutez vos documents
        </div>
        {[
          "Carte nationale d’identité",
          "Permis de conduire",
          "Carte grise",
        ].map((s, i) => {
          const ok = f > 25 + i * 22;
          return (
            <div
              key={s}
              style={{
                border: "2px solid #e5e9df",
                padding: "27px 20px",
                borderRadius: 22,
                marginBottom: 20,
                display: "flex",
                gap: 20,
                alignItems: "center",
                background: ok ? "#f0f4ed" : "white",
              }}
            >
              {i === 2 ? <Car size={39} /> : <CreditCard size={39} />}
              <div style={{ fontSize: 23, fontWeight: 600, flex: 1 }}>
                {s}
                <div style={{ fontSize: 18, color: C.muted, marginTop: 9 }}>
                  {ok ? "Document ajouté" : "Photo ou PDF"}
                </div>
              </div>
              {ok ? (
                <Check color={C.green} size={31} />
              ) : (
                <span style={{ fontSize: 30, color: C.coral }}>+</span>
              )}
            </div>
          );
        })}
        <div
          style={{
            background: C.coral,
            padding: 24,
            borderRadius: 18,
            textAlign: "center",
            fontSize: 24,
            fontWeight: 700,
            marginTop: 30,
          }}
        >
          Valider et continuer →
        </div>
      </Phone>
      <div
        style={{
          marginTop: 32,
          textAlign: "center",
          fontSize: 23,
          color: C.muted,
        }}
      >
        Démonstration · données fictives
      </div>
    </Scene>
  );
}
function Review() {
  const f = useCurrentFrame();
  const scan = f < 48;
  return (
    <Scene>
      <Brand />
      <div style={{ ...small, marginTop: 70, color: C.coral }}>
        02 / Vérifiez
      </div>
      <h1 style={title}>
        Louma lit.
        <br />
        <span style={{ color: C.green }}>
          Vous gardez
          <br />
          la main.
        </span>
      </h1>
      <div
        style={{
          ...card,
          marginTop: 52,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 17,
            fontSize: 28,
            fontWeight: 700,
            color: C.green,
            marginBottom: 30,
          }}
        >
          {scan ? <ScanLine /> : <Check />}
          {scan ? "Lecture du document…" : "Informations extraites"}
        </div>
        {[
          ["Nom complet", "CLIENT EXEMPLE"],
          ["N° du permis", "EXEMPLE-001"],
          ["Marque et modèle", "Dacia Sandero — exemple"],
        ].map(([k, v], i) => (
          <div
            key={k}
            style={{
              marginTop: 25,
              opacity: scan
                ? 0.3
                : interpolate(f, [48 + i * 9, 58 + i * 9], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }),
            }}
          >
            <div style={{ fontSize: 22, color: C.muted, marginBottom: 12 }}>
              {k}
            </div>
            <div
              style={{
                background: "#f7f8f3",
                padding: 22,
                borderRadius: 14,
                fontSize: 27,
                border: "2px solid #e5e9df",
              }}
            >
              {v}
            </div>
          </div>
        ))}
        {scan && (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 110 + (f % 48) * 10,
              height: 5,
              background: C.coral,
              boxShadow: `0 0 55px 25px ${C.coral}44`,
            }}
          />
        )}
        <div
          style={{
            marginTop: 32,
            padding: 24,
            background: C.green,
            color: "white",
            borderRadius: 18,
            textAlign: "center",
            fontSize: 25,
            fontWeight: 700,
          }}
        >
          Vérifier et valider ✓
        </div>
      </div>
      <p style={{ fontSize: 31, lineHeight: 1.45, marginTop: 38 }}>
        Corrigez les champs.
        <br />
        Validez chaque information.
      </p>
      <span style={{ fontSize: 22, color: C.muted }}>
        Exemple fictif · l’authenticité reste à vérifier.
      </span>
    </Scene>
  );
}
function Pdf() {
  const f = useCurrentFrame();
  return (
    <Scene>
      <Brand />
      <div style={{ ...small, marginTop: 70, color: C.coral }}>
        03 / Téléchargez
      </div>
      <h1 style={title}>
        Le contrat suit.
        <br />
        <span style={{ color: C.green }}>
          Votre journée
          <br />
          aussi.
        </span>
      </h1>
      <div
        style={{
          ...card,
          margin: "40px auto 0",
          width: 660,
          transform: `rotate(${interpolate(ease(f), [0, 1], [-8, 3])}deg)`,
          padding: 46,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "3px solid #263c36",
            paddingBottom: 25,
          }}
        >
          <b style={{ fontSize: 30 }}>louma.</b>
          <span style={{ fontSize: 18, color: C.coral }}>EXEMPLE</span>
        </div>
        <h2 style={{ fontSize: 32, marginTop: 35 }}>CONTRAT DE LOCATION</h2>
        <p style={{ fontSize: 20, color: C.muted }}>Véhicule sans chauffeur</p>
        {[
          "Agence & locataire",
          "Véhicule",
          "Dates, tarif & caution",
          "Conditions & signatures",
        ].map((s, i) => (
          <div key={s} style={{ marginTop: 25 }}>
            <b style={{ fontSize: 22 }}>
              {String(i + 1).padStart(2, "0")} — {s}
            </b>
            <div
              style={{
                height: 8,
                background: "#e8e9e3",
                marginTop: 17,
                width: "95%",
              }}
            />
            <div
              style={{
                height: 8,
                background: "#e8e9e3",
                marginTop: 12,
                width: "72%",
              }}
            />
          </div>
        ))}
        <div
          style={{
            marginTop: 36,
            display: "flex",
            justifyContent: "space-between",
            fontSize: 19,
            color: C.muted,
          }}
        >
          <span>Signature agence</span>
          <span>Signature client</span>
        </div>
      </div>
      <div
        style={{
          margin: "38px auto 0",
          width: 710,
          background: C.coral,
          padding: 26,
          borderRadius: 20,
          fontSize: 28,
          fontWeight: 700,
          display: "flex",
          justifyContent: "center",
          gap: 16,
        }}
      >
        <Download />
        Télécharger le PDF
      </div>
      <p
        style={{
          fontSize: 23,
          lineHeight: 1.5,
          textAlign: "center",
          color: C.muted,
        }}
      >
        Complétez la location, relisez les conditions
        <br />
        et faites signer le contrat.
      </p>
    </Scene>
  );
}
function End() {
  const f = useCurrentFrame();
  return (
    <Scene dark>
      <Brand />
      <div style={{ marginTop: 130 }}>
        <Pill>
          <Sparkles size={28} />
          Pensé pour le Maroc
        </Pill>
      </div>
      <h1 style={{ ...title, fontSize: 108, marginTop: 48 }}>
        Moins de
        <br />
        papier.
        <br />
        <span style={{ color: C.coral }}>
          Plus de
          <br />
          route.
        </span>
      </h1>
      <p style={{ fontSize: 35, lineHeight: 1.5, marginTop: 45 }}>
        Le copilote des agences
        <br />
        de location.
      </p>
      <div
        style={{
          background: C.coral,
          borderRadius: 24,
          padding: "30px 34px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 36,
          fontWeight: 800,
          marginTop: 60,
          transform: `scale(${1 + Math.sin(f / 12) * 0.012})`,
        }}
      >
        Essayez Louma
        <ArrowUpRight size={45} />
      </div>
      <div style={{ fontSize: 26, marginTop: 25, color: "#c4cec5" }}>
        Sans inscription · Gratuit pour commencer
      </div>
      <div style={{ fontSize: 27, marginTop: 65, letterSpacing: 2 }}>
        FRANÇAIS / ENGLISH / العربية
      </div>
    </Scene>
  );
}
export function LoumaDemo() {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill
      style={{
        fontFamily: "Arial, Helvetica, sans-serif",
        background: C.cream,
      }}
    >
      <Audio src={staticFile("video/louma-beat.wav")} volume={0.27} />
      <Sequence from={0} durationInFrames={135}>
        <Hook />
      </Sequence>
      <Sequence from={135} durationInFrames={165}>
        <Upload />
      </Sequence>
      <Sequence from={300} durationInFrames={180}>
        <Review />
      </Sequence>
      <Sequence from={480} durationInFrames={165}>
        <Pdf />
      </Sequence>
      <Sequence from={645} durationInFrames={165}>
        <End />
      </Sequence>
      <div
        style={{
          position: "absolute",
          left: 95,
          right: 170,
          bottom: 215,
          display: "flex",
          gap: 10,
        }}
      >
        {[0, 135, 300, 480, 645].map((s) => (
          <div
            key={s}
            style={{
              height: 5,
              flex: 1,
              background: f >= s ? C.coral : "#aab7a34d",
              borderRadius: 8,
            }}
          />
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          left: 95,
          bottom: 155,
          fontSize: 22,
          color: f >= 645 ? "#c4cec5" : C.muted,
          letterSpacing: 2,
        }}
      >
        LOUMA · LOCATION, SIMPLIFIÉE
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: 5,
          background: C.coral,
          width: `${(f / durationInFrames) * 100}%`,
        }}
      />
    </AbsoluteFill>
  );
}
