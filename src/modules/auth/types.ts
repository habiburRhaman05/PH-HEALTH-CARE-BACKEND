export type IRegisterPayload = {
  name: string;
  email: string;
  password: string;
  role?: "DOCTOR" | "PATIENT"; // optional, default = STUDENT
};

export type ILoginUserPayload = {
  email: string;
  password: string;
};


