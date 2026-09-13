import { BrandMockups } from "@/features/baseline/components/BrandMockups";
import { BaselineReader } from "@/features/baseline/components/BaselineReader";
import { findBaselineTopic } from "@/features/baseline/model/baseline";

export const metadata = { title: "Brand concepts · IFR Quick Study" };

export default function DesignSystemPage() {
  const topic = findBaselineTopic("holding-entries")!;
  return <BrandMockups><BaselineReader topic={topic} /></BrandMockups>;
}
