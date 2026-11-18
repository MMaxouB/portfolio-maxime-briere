import type { Metadata } from "next";
import { ContactSection } from "@/components/home/ContactSection";

export const metadata: Metadata = {
  title: "Contact",
  description: "Email, GitHub or Discord — for a project, backend work or a security question.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return <ContactSection standalone />;
}
