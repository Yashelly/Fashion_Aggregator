import { NextResponse } from "next/server";
import { getMockProducts } from "@/lib/mock-products";

type OutRouteProps = {
  params: Promise<{
    productId: string;
  }>;
};

const storeHomepages: Record<string, string> = {
  modivo_lt: "https://modivo.lt/",
  reserved_lt: "https://www.reserved.com/lt/en/",
  sinsay_lt: "https://www.sinsay.com/lt/en/",
  sizeer_lt: "https://sizeer.lt/",
};

export async function GET(request: Request, { params }: OutRouteProps) {
  const { productId } = await params;
  const product = getMockProducts().find(
    (item) => item.mock_product_id === productId,
  );

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Preview stub: after affiliate approval this route should write outbound_clicks
  // and redirect to the approved affiliate URL or deeplink.
  return NextResponse.redirect(
    new URL(storeHomepages[product.store_slug] ?? "/data-sources", request.url),
  );
}
