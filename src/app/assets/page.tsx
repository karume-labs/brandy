import { redirect } from "next/navigation";

/** The library lives at the root now - keep the old path working. */
const PublicAssetsAlias = () => redirect("/");

export default PublicAssetsAlias;
