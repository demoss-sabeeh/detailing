import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { GALLERY } from "@/lib/gallery";
import { Reveal, ParallaxImage } from "@/components/site/Motion";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About KVS Auto Detailing — Phoenix Detailing Studio" },
      { name: "description", content: "A climate-controlled Phoenix studio focused on paint correction, ceramic coating and paint protection film." },
      { property: "og:title", content: "About — KVS Auto Detailing" },
      { property: "og:description", content: "Our approach to premium detailing in Phoenix." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

function About() {
  return (
    <SiteLayout>
      <PageHeader eyebrow="About" title="A studio built around the finish.">
        KVS Auto Detailing is a Phoenix detailing studio focused on paint correction, ceramic coating and paint protection film — with the same process on every vehicle.
      </PageHeader>
      <section className="container-site grid gap-12 py-24 md:py-32 lg:grid-cols-2 lg:items-center">
        <ParallaxImage src={GALLERY[2].src} alt="Machine polishing an Audi RS5 hood" className="aspect-[4/5] w-full" />
        <div className="space-y-8">
          {[
            ["Inspect first", "Every vehicle is inspected under studio lighting and paint-depth measured before we recommend anything."],
            ["Controlled environment", "Coatings and film are installed indoors, away from dust and Arizona heat."],
            ["Clear communication", "You get a clear quote, a confirmed time, and a reminder before your visit."],
          ].map(([t, d]) => (
            <Reveal key={t} className="border-t border-navy/15 pt-6">
              <h2 className="font-display text-3xl text-navy">{t}</h2>
              <p className="mt-2 leading-relaxed text-slate">{d}</p>
            </Reveal>
          ))}
          <Button asChild variant="cta" size="lg"><Link to="/quote">Get a quote</Link></Button>
        </div>
      </section>
    </SiteLayout>
  );
}
