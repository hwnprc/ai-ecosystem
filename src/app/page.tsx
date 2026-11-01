import Explorer from "@/components/Explorer";
import { mapData } from "@/lib/data";

export default function Home() {
  return <Explorer data={mapData} />;
}
