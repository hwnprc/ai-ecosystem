import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import ValueCapture from "@/components/value-capture/ValueCapture";

const plex = IBM_Plex_Sans({
  variable: "--font-plex",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "Where AI Value Goes",
  description:
    "An interactive reading of the AI Frontier value capture deck, mapped to the six layers of the US AI ecosystem map.",
};

export default function ValueCapturePage() {
  return (
    <div className={plex.variable}>
      <ValueCapture />
    </div>
  );
}
