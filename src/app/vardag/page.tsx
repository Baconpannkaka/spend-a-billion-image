import { GameStarter } from "@/components/game-starter";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Vardagsläge", description: "Välj en vardagsbudget och shoppa bland 10 000 igenkännbara produkter." };
export default function EverydayPage() { return <GameStarter mode="everyday" />; }
