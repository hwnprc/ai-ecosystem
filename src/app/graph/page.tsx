import type { Metadata } from "next";
import GraphExplorer from "@/components/graph/GraphExplorer";
import { mapData } from "@/lib/data";

export const metadata: Metadata = {
  title: "AI Ecosystem Graph",
  description: "AI companies as rings around the customer. Click a company to see who it is connected to.",
};

export default function GraphPage() {
  return <GraphExplorer data={mapData} />;
}
