import { CartClient } from "@/components/cart-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Varukorg" };
export default function CartPage() { return <CartClient />; }
