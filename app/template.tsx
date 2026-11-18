import { ViewTransition } from "react";

/**
 * A template (unlike a layout) is re-created on every navigation, so React sees
 * the old page leave and the new one arrive and plays the page-out / page-in
 * animations defined in globals.css. The header, the sky and the footer live
 * in the layout and do not move.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page-in" exit="page-out" default="none">
      {children}
    </ViewTransition>
  );
}
