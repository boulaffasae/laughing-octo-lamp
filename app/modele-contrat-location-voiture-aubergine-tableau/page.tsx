import { ModelPage, modelMetadata } from "@/app/components/louma/model-page";
import { publicContractTemplate } from "@/lib/contract/templates";

const template = publicContractTemplate("tabular");

export const metadata = modelMetadata(template);

export default function Page() {
  return <ModelPage template={template} />;
}
