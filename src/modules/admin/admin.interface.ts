import { Admin, User, UserRole, UserStatus } from "../../generated/prisma/client";

export interface IUpdateAdmin {
    admidId:string;
    admin:Partial<Admin>
    user:Partial<User>
}

export interface IDeleteAdmin{
    id:string
}

export interface IChangeUserStatusOrRole{
    userId:string,
    status:UserStatus | false,
    role?:UserRole | false,
}