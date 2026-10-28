import { BrandDetailView } from "@/features/brand/components/BrandDetailView";

interface BrandPageProps {
  params: Promise<{ brandId: string }>;
}

/** Brand identity hub: tokens, assets and LLM prompts. */
const BrandPageRoute = async ({ params }: BrandPageProps) => {
  const { brandId } = await params;
  return <BrandDetailView brandId={brandId} />;
};

export default BrandPageRoute;
