import { redirect } from "next/navigation";

export default async function Page({ params }: PageProps<"/[locale]/new">) {
  const { locale } = await params;
  redirect(`/${locale}#contrat`);
}
