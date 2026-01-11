import { SupabaseClient } from "@supabase/supabase-js";
import { DeleteAssetAction, GetAssetAction, GetAssetsAction, UpdateAssetAction, UploadAssetAction } from "../assets";
import { GetChaiUserAction } from "../user";
import { DeleteFromStorageAction } from "./delete-from-storage";
import { UploadToStorageAction } from "./upload-to-storage";

export { DeleteFromStorageAction } from "./delete-from-storage";
export { UploadToStorageAction } from "./upload-to-storage";

export const SubabaseAuthActions = (supabase: SupabaseClient) => ({
  GET_CHAI_USER: new GetChaiUserAction(supabase),
});

export const SubabaseStorageActions = (supabase: SupabaseClient) => ({
  // Asset management actions
  UPLOAD_ASSET: new UploadAssetAction(supabase),
  GET_ASSET: new GetAssetAction(supabase),
  GET_ASSETS: new GetAssetsAction(supabase),
  DELETE_ASSET: new DeleteAssetAction(supabase),
  UPDATE_ASSET: new UpdateAssetAction(supabase),
  // Generic storage actions
  UPLOAD_TO_STORAGE: new UploadToStorageAction(supabase),
  DELETE_FROM_STORAGE: new DeleteFromStorageAction(supabase),
});
