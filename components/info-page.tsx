import type { ReactNode } from "react";

type InfoPageProps = {
  children: ReactNode;
  intro?: string;
  title: string;
};

type ProseSectionProps = {
  children: ReactNode;
  title?: string;
};

export function InfoPage({
  title,
  intro,
  children,
}: InfoPageProps): React.ReactElement {
  return (
    <div className="route-shell info-route">
      <header className="route-heading">
        <div>
          <h1>{title}</h1>
          {intro && <p className="lead">{intro}</p>}
        </div>
      </header>
      <div className="info-content">{children}</div>
    </div>
  );
}

export function ProseSection({
  title,
  children,
}: ProseSectionProps): React.ReactElement {
  return (
    <section className="prose-section">
      <div>
        {title && <h2>{title}</h2>}
        {children}
      </div>
    </section>
  );
}
