import { CarFront } from "lucide-react";

export function DocumentPreview({ kind = 0 }: { kind?: number }) {
  return (
    <div className={`mini-id id-${kind}`}>
      <div className="id-top">
        <span>المملكة المغربية</span>
        <span>✳</span>
      </div>
      <small>
        {kind === 2 ? "CERTIFICAT D’IMMATRICULATION" : "ROYAUME DU MAROC"}
      </small>
      <div className="id-content">
        <div className="id-photo">
          {kind === 2 ? <CarFront size={28} /> : <div className="silhouette" />}
        </div>
        <div className="id-lines">
          <b>{kind === 2 ? "DACIA · CLIO" : "AMINE EL MANSOURI"}</b>
          <span />
          <span />
          <span />
          <strong>{kind === 2 ? "12345 · أ · 6" : "BK 123456"}</strong>
        </div>
      </div>
      <div className="id-bottom">
        {kind === 0
          ? "CARTE NATIONALE D’IDENTITÉ"
          : kind === 1
            ? "PERMIS DE CONDUIRE"
            : "CARTE GRISE"}
        <span>MAR</span>
      </div>
    </div>
  );
}
