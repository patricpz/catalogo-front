import { getMyStore, Store } from "@/lib/api/stores";
import { useQuery } from "@tanstack/react-query";

export const useStore = () => {
  return useQuery<Store | null>({
    queryKey: ["store", "me"],
    queryFn: getMyStore,
  });
};