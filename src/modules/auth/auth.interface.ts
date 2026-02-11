export interface IRegisterPayload  {
  name: string;
  email: string;
  password: string;
  role?: "DOCTOR" | "PATIENT"; // optional, default = STUDENT
};

export interface ILoginUserPayload  {
  email: string;
  password: string;
};


export interface IRequestUser{
  role:string;
  userId:string;
}
export interface IChangePassword{
  sessionToken:string;
  currentPassword:string;
  newPassword:string;
}

