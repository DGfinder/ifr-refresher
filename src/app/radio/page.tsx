import { Suspense } from "react";
import { RadioScreen } from "@/features/radio-calls";

// `useSearchParams` inside `RadioScreen` opts the tree into CSR for the
// query-param read. Suspense lets Next prerender the page shell statically
// and stream the params-aware part on the client.
export default function Page() {
  return (
    <Suspense fallback={null}>
      <RadioScreen />
    </Suspense>
  );
}
