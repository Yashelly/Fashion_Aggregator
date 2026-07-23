import { ProductGrid } from "@/components/product-grid";
import {
  filterProducts,
  getMockProducts,
  getStoreOptions,
} from "@/lib/mock-products";

type SearchPageProps = {
  searchParams: Promise<{
    query?: string;
    store?: string;
    category?: string;
    color?: string;
    gender?: string;
  }>;
};

function unique(values: string[]) {
  return Array.from(new Set(values)).filter(Boolean).sort();
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const products = getMockProducts();
  const results = filterProducts(products, params);
  const stores = getStoreOptions(products);
  const categories = unique(products.map((product) => product.category));
  const colors = unique(products.map((product) => product.color));
  const genders = unique(products.map((product) => product.gender));

  return (
    <div className="stack">
      <div>
        <h1 className="page-title">Demo search</h1>
        <p className="lead">
          This page uses synthetic products from <code>data/mock_products.csv</code>.
          Replace this with approved affiliate feeds after network approval.
        </p>
      </div>

      <form action="/search">
        <div className="filters">
          <label className="field">
            <span>Query</span>
            <input
              className="input"
              defaultValue={params.query ?? ""}
              name="query"
              placeholder="sneakers, black, streetwear"
            />
          </label>
          <label className="field">
            <span>Store</span>
            <select className="select" defaultValue={params.store ?? ""} name="store">
              <option value="">All stores</option>
              {stores.map((store) => (
                <option key={store.value} value={store.value}>
                  {store.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Department</span>
            <select className="select" defaultValue={params.gender ?? ""} name="gender">
              <option value="">All departments</option>
              {genders.map((gender) => (
                <option key={gender} value={gender}>
                  {gender}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Category</span>
            <select
              className="select"
              defaultValue={params.category ?? ""}
              name="category"
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Color</span>
            <select className="select" defaultValue={params.color ?? ""} name="color">
              <option value="">All colors</option>
              {colors.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button className="button" type="submit">
          Apply filters
        </button>
      </form>

      <p className="small">
        {results.length} demo results. These are not live merchant products.
      </p>

      <ProductGrid products={results} />
    </div>
  );
}
