import { redirect } from "next/navigation";

// Drill is the FSRS engine behind the flashcard UI, not a separate mode.
// Keep the old route working, but land it on the one practice surface.
export default function Page() {
  redirect("/flashcard");
}
