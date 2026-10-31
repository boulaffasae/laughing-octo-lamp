import { ContractBuilder } from "@/app/components/contract/contract-builder";
import { SiteShell } from "@/app/components/layout/site-shell";

export default function Page() {
  return (
    <SiteShell>
      <ContractBuilder />
    </SiteShell>
  );
}
