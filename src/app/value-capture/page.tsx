import type { Metadata } from "next";
import ValueCapture from "@/components/value-capture/ValueCapture";

export const metadata: Metadata = {
  title: "Where AI Value Goes",
  description:
    "An interactive reading of the AI Frontier value capture deck, mapped to the six layers of the US AI ecosystem map.",
};

export default function ValueCapturePage() {
  return <ValueCapture />;
}
