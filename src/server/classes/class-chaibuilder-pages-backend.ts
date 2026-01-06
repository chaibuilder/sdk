import { has } from "lodash-es";
import { API_URL, ChaiBuilderPagesBackendInterface } from "../export";

export class ChaiBuilderPagesBackend
  implements ChaiBuilderPagesBackendInterface
{
  constructor(
    private apiKey: string = "",
    private apiUrl: string = API_URL
  ) {}

  async handleUsersAction(body: any, authToken: string) {
    const response = await fetch(`${this.apiUrl}/v1/api/users`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "x-chai-api-key": this.apiKey,
        "x-chai-auth-token": authToken,
      },
    });

    const json = await response.json();
    if (has(json, "error")) {
      return { ...json, status: response.status };
    }
    return json;
  }

  async handleAction(body: any, authToken: string) {
    const response = await fetch(`${this.apiUrl}/v1/api/chai`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "x-chai-api-key": this.apiKey,
        "x-chai-auth-token": authToken,
      },
    });
    const json = await response.json();
    if (has(json, "error")) {
      return { ...json, status: response.status };
    }
    return json;
  }

  async handleAssetsAction(body: any, authToken: string) {
    const response = await fetch(`${this.apiUrl}/v1/api/assets`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "x-chai-api-key": this.apiKey,
        "x-chai-auth-token": authToken,
      },
    });
    return await response.json();
  }
}
