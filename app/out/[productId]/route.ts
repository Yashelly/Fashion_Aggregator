import { NextResponse } from "next/server";
import { getMockProducts } from "@/lib/mock-products";

type OutRouteProps = {
  params: Promise<{
    productId: string;
  }>;
};

export async function GET(_request: Request, { params }: OutRouteProps) {
  const { productId } = await params;
  const product = getMockProducts().find(
    (item) => item.mock_product_id === productId,
  );

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // MVP stub: after affiliate approval this route should write outbound_clicks
  // and redirect to the approved affiliate URL/deeplink.
  return NextResponse.redirect(new URL(product.mock_url, "https://example.com"));
}

