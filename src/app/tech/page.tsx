import type { Metadata } from "next";
import { isTech } from "@/lib/auth";
import TechDashboard from "./TechDashboard";
import TechLogin from "./TechLogin";

export const metadata: Metadata = { title: "Team panel — NorthGlow", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function TechPage() {
  return (await isTech()) ? <TechDashboard /> : <TechLogin />;
}
