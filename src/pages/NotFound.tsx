import { Link } from "react-router-dom";
import "./NotFound.css";

export default function NotFound() {
  return (
    <div className="notfound">
      <div className="notfound__grid" aria-hidden="true" />
      <div className="notfound__content">
        <span className="notfound__code mono">404</span>
        <h1>Recurso não encontrado</h1>
        <p>
          Este endpoint não existe no perímetro monitorado do GuardFlow. Se você chegou aqui por um link, ele pode
          estar desatualizado.
        </p>
        <div className="notfound__hash mono">
          tentativa registrada · hash <span>{fakeHash()}</span>
        </div>
        <Link to="/" className="btn btn--primary notfound__cta">
          Voltar ao painel
        </Link>
      </div>
    </div>
  );
}

function fakeHash(): string {
  // purely cosmetic on this page — a deterministic-looking short hex string
  // to reinforce the "everything gets logged" identity of the product.
  const chars = "0123456789abcdef";
  let out = "";
  for (let i = 0; i < 12; i += 1) out += chars[Math.floor((i * 977 + 13) % 16)];
  return out;
}
