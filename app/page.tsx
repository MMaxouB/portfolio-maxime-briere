import { Hero } from "@/components/hero/Hero";
import { AboutSection } from "@/components/home/AboutSection";
import { ProjectsSection } from "@/components/home/ProjectsSection";
import { ToolboxSection } from "@/components/home/ToolboxSection";
import { ContactSection } from "@/components/home/ContactSection";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { getProjects } from "@/lib/projects";

/**
 * One long night: hero → about → projects → toolbox → contact, then the
 * footer's skyline. Every section owns its own scenery (faded at both edges, so
 * nothing ends in a hard line); a drawn hairline marks each handoff.
 */
export default function Home() {
  const projects = getProjects();
  return (
    <>
      <Hero />
      <AboutSection />
      <SectionDivider />
      <ProjectsSection projects={projects} />
      <SectionDivider />
      <ToolboxSection projects={projects} />
      <SectionDivider />
      <ContactSection />
    </>
  );
}
