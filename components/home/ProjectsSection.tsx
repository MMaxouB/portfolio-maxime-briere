import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Project } from "@/lib/projects";
import { ProjectExplorer } from "@/components/projects/ProjectExplorer";
import { SectionHeader, Em } from "@/components/ui/SectionHeader";
import { HandNote } from "@/components/ui/HandNote";
import { Planet } from "@/components/scenery/Planet";

export function ProjectsSection({ projects }: { projects: Project[] }) {
  return (
    <section id="projects" aria-labelledby="projects-title" className="relative isolate overflow-hidden py-24 sm:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute left-1/2 top-[8%] h-[50%] w-[80%] -translate-x-1/2"
          style={{ background: "radial-gradient(closest-side, rgba(124,92,255,0.14), transparent)" }}
        />
        {/* A wide, flat horizon under the grid — only its top arc is ever seen */}
        <Planet tone="indigo" className="absolute -bottom-[1680px] left-1/2 w-[2200px] max-w-none -translate-x-1/2 opacity-80" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent to-night" />
      </div>

      <div className="relative mx-auto max-w-[1240px] px-5 sm:px-8">
        <div className="absolute right-6 top-0 hidden lg:block">
          <HandNote rotate={8} className="text-[1.3rem]">
            build,
            <br />
            &nbsp;&nbsp;break,
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;learn.
          </HandNote>
        </div>

        <SectionHeader
          path="~/projects"
          id="projects-title"
          align="center"
          lines={["Built for real,", <Em key="em">tested for worse.</Em>]}
          description="Six I would show first. Each card runs a tiny live sketch of the idea — hover one to start it."
        />

        <div className="mt-10">
          <ProjectExplorer projects={projects} initial="selected" filters={["selected", "ai", "web", "security", "open"]} />
        </div>

        <div className="mt-12 flex justify-center">
          <Link href="/projects" className="btn-ghost">
            All {projects.length} projects, with filters <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
