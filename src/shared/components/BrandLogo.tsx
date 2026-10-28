import Image from "next/image";

interface BrandLogoProps {
  size?: number;
  /**
   * Preload only when the logo is the page's likely LCP (auth screens) -
   * never for logos buried in modals.
   */
  priority?: boolean;
}

/** Brandy icon mark, used on auth pages and at the top of form modals. */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 48,
  priority = false,
}) => (
  <Image
    src="/logo.png"
    alt="Brandy Logo"
    width={size}
    height={size}
    priority={priority}
  />
);
