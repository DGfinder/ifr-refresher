import { BaselineContents } from "@/features/baseline/components/BaselineContents";
import { baselineCatalog } from "@/features/baseline/model/baseline";

export default function Page() {
  return <BaselineContents topics={baselineCatalog} />;
}
