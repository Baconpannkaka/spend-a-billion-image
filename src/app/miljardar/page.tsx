import { GameStarter } from "@/components/game-starter";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Miljardärsläge", description: "Välj en känd förmögenhet, en miljard eller din egen aktiedröm." };
export default function BillionairePage() { return <GameStarter mode="luxury" />; }
