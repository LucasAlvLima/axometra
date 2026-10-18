export type LoginActionState = {
  status: "idle" | "error";
  message: string | null;
  fieldErrors: {
    email?: string;
    password?: string;
  };
};

export type LogoutActionState = {
  status: "idle" | "error";
  message: string | null;
};

export const initialLoginState: LoginActionState = {
  status: "idle",
  message: null,
  fieldErrors: {},
};

export const initialLogoutState: LogoutActionState = {
  status: "idle",
  message: null,
};
