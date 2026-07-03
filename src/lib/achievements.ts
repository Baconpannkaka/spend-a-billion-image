import { getCartTotal, getTotalQuantity } from "@/lib/cart";
import type { Achievement, CartItem, Product } from "@/types";

export function getResultVerdict(ratio: number): string {
  if (ratio < 0.5) return "Oväntat försiktig med pengarna.";
  if (ratio < 0.8) return "Du har fortfarande råd med något dumt.";
  if (ratio < 0.95) return "En stark shoppinginsats.";
  if (ratio < 0.995) return "Nästan obehagligt bra spenderat.";
  return "Du lämnade i princip bara dricks.";
}

export function getAchievements(cart: CartItem[], products: Product[], startingBudgetSek: number): Achievement[] {
  const productMap = new Map(products.map((product) => [product.id, product]));
  const entries = cart.flatMap((item) => {
    const product = productMap.get(item.productId);
    return product ? [{ item, product }] : [];
  });
  const categories = new Set(entries.map((entry) => entry.product.categoryId));
  const total = getCartTotal(cart, products);
  const remaining = Math.max(0, startingBudgetSek - total);
  const achievements: Achievement[] = [];

  const bugattis = entries.filter((entry) => entry.product.name.toLowerCase().includes("bugatti")).reduce((sum, entry) => sum + entry.item.quantity, 0);
  if (bugattis >= 2) achievements.push({ id: "bugatti", title: "Bugatti-samlare", description: "Minst två Bugatti i samma fantasigarage." });
  if (entries.some((entry) => entry.product.categoryId === "flyg")) achievements.push({ id: "flyg", title: "Privatflygare", description: "Du tog genvägen genom säkerhetskontrollen." });
  if (entries.some((entry) => entry.product.categoryId === "batar")) achievements.push({ id: "hav", title: "Havets härskare", description: "En yacht fick plats i kundvagnen." });
  if (entries.filter((entry) => entry.product.categoryId === "fastigheter").length >= 2) achievements.push({ id: "fastighet", title: "Fastighetsmogul", description: "Minst två adresser att glömma postnumret till." });
  if (entries.filter((entry) => entry.product.categoryId === "klockor").reduce((sum, entry) => sum + entry.item.quantity, 0) >= 3) achievements.push({ id: "klockor", title: "Klockren", description: "Tre klockor eller fler. Fortfarande samma tid." });
  if (entries.some((entry) => entry.product.collectible?.gradingCompany === "PSA")) achievements.push({ id: "psa", title: "Slab collector", description: "Du lade ett PSA-graderat samlarkort i samlingen." });
  if (remaining < Math.max(1_000_000, startingBudgetSek * 0.001)) achievements.push({ id: "perfekt", title: "Perfekt spenderare", description: "Mindre än 0,1 % av budgeten blev kvar." });
  if (cart.some((item) => item.quantity >= 10)) achievements.push({ id: "tio", title: "Jag tar tio", description: "Minst tio exemplar av samma produkt." });
  if (categories.size >= 5) achievements.push({ id: "variation", title: "Lite av varje", description: "Du handlade från minst fem kategorier." });
  if (getTotalQuantity(cart) >= 100) achievements.push({ id: "hundra", title: "Kundvagn utan botten", description: "Minst hundra saker fick följa med." });

  return achievements;
}
