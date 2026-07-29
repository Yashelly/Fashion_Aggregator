import type { ReactNode } from "react";

type InfoPageProps = {
  children: ReactNode;
  eyebrow: string;
  intro?: string;
  number?: string;
  title: string;
};

type ProseSectionProps = {
  children: ReactNode;
  number: string;
  title?: string;
};

export function InfoPage({
  number = "01",
  eyebrow,
  title,
  intro,
  children,
}: InfoPageProps): React.ReactElement {
  return (
    <div className="route-shell info-route">
      <header className="route-heading">
        <div className="section-rail">
          <span>{number}</span>
          <p>{eyebrow}</p>
        </div>
        <div>
          <p className="preview-kicker">VIBEWEAR / PUBLIC INFORMATION</p>
          <h1>{title}</h1>
          {intro && <p className="lead">{intro}</p>}
        </div>
      </header>
      <div className="info-content">{children}</div>
    </div>
  );
}

export function ProseSection({
  number,
  title,
  children,
}: ProseSectionProps): React.ReactElement {
  return (
    <section className="prose-section">
      <span className="prose-number">{number}</span>
      <div>
        {title && <h2>{title}</h2>}
        {children}
      </div>
    </section>
  );
}
