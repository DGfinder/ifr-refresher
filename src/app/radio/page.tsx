import { redirect } from "next/navigation";

// Radio practice is the phraseology chapter drilled as calls: the situation is
// the prompt, the call script is the answer. That is the same spaced-repetition
// surface as everything else, so point at it rather than run a parallel one.
export default function Page() {
  redirect("/flashcard?program=phraseology");
}
