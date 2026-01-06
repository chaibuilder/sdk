import {
  AssetsParams,
  ChaiAsset,
  ChaiBuilderPagesAssetsInterface,
  ChaiBuilderPagesBackendInterface,
} from "../export";

export class ChaiBuilderPagesAssets implements ChaiBuilderPagesAssetsInterface {
  constructor(private backend: ChaiBuilderPagesBackendInterface) {}

  async upload(
    {
      file,
      folderId,
      name,
    }: {
      file: Base64URLString;
      folderId?: string | null;
      name?: string;
    },
    authToken: string
  ): Promise<ChaiAsset | { error: string }> {
    const response = await this.backend.handleAssetsAction?.(
      {
        action: "UPLOAD_ASSET",
        data: {
          name,
          file,
          folderId,
        },
      },
      authToken
    );
    return response;
  }

  async getAsset(
    { id }: { id: string },
    authToken: string
  ): Promise<ChaiAsset | { error: string }> {
    return this.backend.handleAssetsAction?.(
      { action: "GET_ASSET", data: { id } },
      authToken
    );
  }
  async getAssets(params: AssetsParams, authToken: string) {
    return this.backend.handleAssetsAction?.(
      {
        action: "GET_ASSETS",
        data: params,
      },
      authToken
    );
  }

  async deleteAsset(
    { id }: { id: string },
    authToken: string
  ): Promise<{ success: boolean } | { error: string }> {
    return this.backend.handleAssetsAction?.(
      {
        action: "DELETE_ASSET",
        data: { id },
      },
      authToken
    );
  }

  async updateAsset(
    {
      id,
      file,
      description,
    }: {
      id: string;
      file?: Base64URLString;
      description?: string;
    },
    authToken: string
  ) {
    return this.backend.handleAssetsAction?.(
      {
        action: "UPDATE_ASSET",
        data: { id, file, description },
      },
      authToken
    );
  }
}
