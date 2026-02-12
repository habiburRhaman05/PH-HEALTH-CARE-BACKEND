import { Admin, User } from "../../generated/prisma/client";

export interface IUpdateAdmin {
    admidId:string;
    admin:Partial<Admin>
    user:Partial<User>
}

export interface IDeleteAdmin{
    id:string
}