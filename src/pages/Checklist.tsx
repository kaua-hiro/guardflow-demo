import { useMemo } from "react";
import PageHeader from "../components/PageHeader";
import { useAppData } from "../context/AppDataContext";
import "../components/ui.css";
import "./Checklist.css";

export default function Checklist() {
  const { checklist, toggleChecklistItem } = useAppData();

  const grouped = useMemo(() => {
    const map = new Map<string, typeof checklist>();
    for (const item of checklist) {
      const list = map.get(item.category) ?? [];
      list.push(item);
      map.set(item.category, list);
    }
    return Array.from(map.entries());
  }, [checklist]);

  const doneCount = checklist.filter((c) => c.done).length;
  const progress = checklist.length > 0 ? Math.round((doneCount / checklist.length) * 100) : 0;

  return (
    <div>
      <PageHeader
        eyebrow="Frameworks SOC 2 · ISO 27001 · LGPD"
        title="Checklist de compliance"
        description="Controles cobrados em auditorias reais de certificação. Marque conforme sua organização os implementa."
      />

      <div className="card checklist__progress-card">
        <div className="checklist__progress-head">
          <span>Progresso geral</span>
          <span className="mono">{doneCount} / {checklist.length} controles</span>
        </div>
        <div className="checklist__progress-bar">
          <div className="checklist__progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {grouped.map(([category, items]) => (
        <div className="card checklist__group" key={category}>
          <h2 className="section-title">{category}</h2>
          <ul className="checklist__list">
            {items.map((item) => (
              <li key={item.id} className={`checklist__item ${item.done ? "is-done" : ""}`}>
                <button
                  className="checklist__check"
                  onClick={() => toggleChecklistItem(item.id)}
                  aria-pressed={item.done}
                  aria-label={item.done ? "Marcar como pendente" : "Marcar como concluído"}
                >
                  {item.done && <CheckIcon />}
                </button>
                <div className="checklist__item-text">
                  <div className="checklist__item-head">
                    <span className="checklist__label">{item.label}</span>
                    <span className="checklist__framework">{item.framework}</span>
                  </div>
                  <p className="checklist__desc">{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#04211d" strokeWidth="3.4">
      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
