import Link from "next/link";
import { Search } from "lucide-react";

const heroVideoUrl =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_094145_4a271a6c-3869-4f1c-8aa7-aeb0cb227994.mp4";

function delay(ms: number) {
  return { animationDelay: `${ms}ms` };
}

const departments = [
  { label: "WOMAN", href: "/search?gender=woman" },
  { label: "MAN", href: "/search?gender=man" },
  { label: "KIDS", href: "/search?gender=kids" },
  { label: "SNEAKERS", href: "/search?query=sneakers" },
];

export function CinematicHero() {
  return (
    <section className="cinematic-hero">
      <video
        aria-hidden="true"
        autoPlay
        className="cinematic-video"
        loop
        muted
        playsInline
        src={heroVideoUrl}
      />
      <div className="cinematic-scrim" aria-hidden="true" />
      <div className="cinematic-bottom-blur" aria-hidden="true" />

      <div className="cinematic-content">
        <div className="cinematic-copy">
          <div className="hero-proof" style={delay(200)}>
            <span>NEW IN</span>
            <span>EDITORIAL</span>
            <span>LITHUANIA MVP</span>
          </div>

          <h1 style={delay(300)}>SHOP BY VIBE</h1>
          <p style={delay(400)}>
            Visual fashion discovery across approved-feed stores.
          </p>

          <form action="/search" className="hero-search" style={delay(500)}>
            <Search size={20} />
            <input
              aria-label="Search demo fashion catalog"
              name="query"
              placeholder="SEARCH"
            />
            <button type="submit">GO</button>
          </form>

          <div className="hero-departments" style={delay(600)}>
            {departments.map((department) => (
              <Link href={department.href} key={department.label}>
                {department.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
