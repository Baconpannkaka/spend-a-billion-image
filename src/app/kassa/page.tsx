import { CheckoutClient } from "@/components/checkout-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Fantasikassa" };
export default function CheckoutPage() { return <CheckoutClient />; }
