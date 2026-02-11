import { Admin, User } from "../../generated/prisma/client";

export interface IUpdateAdmin {
    admidId:string;
    data:Partial<User & Admin>;
}

export interface IDeleteAdmin{
    id:string
}