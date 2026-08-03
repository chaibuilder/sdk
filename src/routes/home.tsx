import { ArrowRight, ExternalLink, Github, Globe, Layers } from "lucide-react";

export default function Home() {
  const navigationItems = [
    {
      title: "Demo Page Builder",
      badge: "Interactive Demo",
      description: "Default page builder. A standalone React component interface with live preview. No backend required.",
      icon: Layers,
      iconBg: "bg-blue-50 text-blue-600 border-blue-100",
      path: "/builder",
      buttonText: "Launch Builder",
      tags: ["React", "Standalone", "No Backend"],
      isExternal: false,
    },
    {
      title: "ChaiPro",
      badge: "Full Stack Starter",
      description: "A self-hosted visual site builder built with Next.js (App Router) and Payload CMS.",
      icon: Globe,
      iconBg: "bg-violet-50 text-violet-600 border-violet-100",
      path: "https://github.com/chaibuilder/chaibuilder-starter",
      buttonText: "Get Started",
      tags: ["Next.js", "Payload CMS", "Self-Hosted"],
      isExternal: true,
    },
  ];

  return (
    <div className="min-h-screen text-zinc-800 antialiased selection:bg-zinc-900 selection:text-white">
      <div className="mx-auto max-w-5xl px-6 py-10">

        <div className="flex items-center justify-center w-full mb-6">
          <img
            src="/lockup-horizontal-light.png"
            alt="ChaiBuilder Logo"
            className="h-10 w-auto object-contain"
          />
        </div>

        {/* Hero Section */}
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
            ChaiBuilder Core
          </h1>

          <p className="mx-auto max-w-2xl text-base leading-relaxed text-zinc-600 sm:text-lg">
            Choose your builder experience. Select between a lightweight standalone React component demo or full-stack production starters.
          </p>
        </div>

        {/* Navigation Cards Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.path}
                className="group flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-8 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-md">
                <div>
                  {/* Top Bar inside Card */}
                  <div className="mb-6 flex items-center justify-between">
                    <div className={`inline-flex rounded-xl p-3 border ${item.iconBg}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full border border-zinc-200/80 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-600">
                      {item.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="mb-2 text-xl font-bold text-zinc-900 group-hover:text-zinc-800">
                    {item.title}
                  </h3>

                  <p className="mb-6 leading-relaxed text-zinc-600 text-sm">
                    {item.description}
                  </p>

                  {/* Tech Tags */}
                  <div className="mb-8 flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 border border-zinc-200/60">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <a
                  href={item.path}
                  target={item.isExternal ? "_blank" : "_self"}
                  rel={item.isExternal ? "noopener noreferrer" : undefined}
                  className="block">
                  <button className="group/btn flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 px-5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-zinc-800 hover:shadow">
                    <span>{item.buttonText}</span>
                    {item.isExternal ? (
                      <ExternalLink className="h-4 w-4 transform transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 opacity-80" />
                    ) : (
                      <ArrowRight className="h-4 w-4 transform transition-transform duration-200 group-hover/btn:translate-x-1 opacity-80" />
                    )}
                  </button>
                </a>
              </div>
            );
          })}
        </div>

        {/* Footer / Status Section */}
        <footer className="mt-20 border-t border-zinc-200/80 pt-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-medium text-zinc-600 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span>ChaiBuilder Core Ready</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
