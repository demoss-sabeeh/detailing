import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getServiceCatalog } from "./public.functions";
import type { ServiceInfo } from "./knowledge";

export const serviceCatalogOptions = queryOptions({ queryKey: ["public", "services"], queryFn: () => getServiceCatalog(), staleTime: 30000 });
export function useServiceCatalog(): ServiceInfo[] { return useSuspenseQuery(serviceCatalogOptions).data; }