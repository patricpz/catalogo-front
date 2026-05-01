import { getMyStore, getStoreProfile, Store } from "@/lib/api/stores";
import type { StoreProfile } from "@/lib/api/types";
import { useQuery } from "@tanstack/react-query";

export const useStore = () => {
  return useQuery<Store | null>({
    queryKey: ["store", "me"],
    queryFn: getMyStore,
  });
};

export const useStoreProfile = () => {
  return useQuery<StoreProfile | null>({
    queryKey: ["store", "profile", "me"],
    queryFn: async () => {
      const store = await getMyStore();
      if (!store?.id) return null;
      return getStoreProfile(store.id);
    },
  });
};