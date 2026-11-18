import type { Metadata } from "next";
import { getProjects } from "@/lib/projects";
import { ProjectExplorer } from "@/components/projects/ProjectExplorer";
import { SectionHeader, Em } from "@/components/ui/SectionHeader";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Every project — open source, public, private and under NDA — in software engineering, AI and security.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  const projects = getProjects();
  const closed = projects.filter((p) => p.type === "private" || p.type === "nda").length;

  return (
    <div className="relative isolate overflow-hidden pb-24 pt-32 sm:pt-40">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute -right-[10%] top-0 h-[60%] w-[60%]"
          style={{ background: "radial-gradient(closest-side, rgba(124,92,255,0.18), transparent)" }}
        />
      </div>
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <SectionHeader
          as="h1"
          path="~/projects --all"
          lines={["Every project,", <Em key="em">public or not.</Em>]}
          description={`${projects.length} projects. ${closed} of them are private or under NDA — they show what I did and how, without the parts that are not mine to share.`}
        />
        <div className="mt-12">
          <ProjectExplorer
            projects={projects}
            initial="all"
            align="left"
            headingLevel="h2"
            filters={["all", "selected", "ai", "web", "security", "open", "closed"]}
          />
        </div>
      </div>
    </div>
  );
}
