import { Hero } from "@/components/hero/Hero";
import { AboutSection } from "@/components/home/AboutSection";
import { ProjectsSection } from "@/components/home/ProjectsSection";
import { ToolboxSection } from "@/components/home/ToolboxSection";
import { ContactSection } from "@/components/home/ContactSection";
import { getProjects } from "@/lib/projects";

/**
 * One long night: hero → about → projects → toolbox → contact, then the
 * footer's skyline. Every section owns its own scenery; the stars behind are
 * shared (layout).
 */
export default function Home() {
  const projects = getProjects();
  return (
    <>
      <Hero />
      <AboutSection />
      <ProjectsSection projects={projects} />
      <ToolboxSection projects={projects} />
      <ContactSection />
    </>
  );
}
