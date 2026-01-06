import {
  ChaiBuilderPagesBackendInterface,
  ChaiBuilderPagesUsersInterface,
  LoggedInUser,
} from "../export";

export class ChaiBuilderPagesUsers implements ChaiBuilderPagesUsersInterface {
  constructor(private backend: ChaiBuilderPagesBackendInterface) {}

  async refreshToken(data: {
    accessToken: string;
    refreshToken: string;
  }): Promise<LoggedInUser | { error: string }> {
    const response = await this.backend.handleUsersAction?.({
      action: "REFRESH_TOKEN",
      data,
    });
    if (response.error) {
      return { error: response.error };
    }
    return response;
  }

  async login({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<LoggedInUser | { error: string }> {
    const response = await this.backend.handleUsersAction?.({
      action: "LOGIN",
      data: { email, password },
    });
    if (response.error) {
      return { error: response.error };
    }
    return response;
  }

  async logout(): Promise<void> {
    await this.backend.handleUsersAction?.({
      action: "LOGOUT",
    });
  }

  async isUserActive(authToken: string): Promise<boolean> {
    const response = await this.backend.handleUsersAction?.(
      {
        action: "CHECK_USER_STATUS",
      },
      authToken
    );
    return response.success;
  }

  async getUserRoleAndPermissions(authToken: string): Promise<{
    role: string;
    permissions: string[] | null;
  }> {
    const response = await this.backend.handleUsersAction?.(
      {
        action: "GET_ROLE_AND_PERMISSIONS",
      },
      authToken
    );
    return response;
  }

  async getUserInfo(authToken: string, data: { userId: string }) {
    const response = await this.backend.handleUsersAction?.(
      {
        action: "GET_CHAI_USER",
        data,
      },
      authToken
    );
    return response;
  }
}
