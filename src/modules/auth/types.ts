export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  role?: "STUDENT" | "TUTOR"; // optional, default = STUDENT
};

export type LoginPayload = {
  email: string;
  password: string;
};


