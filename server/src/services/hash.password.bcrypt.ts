import { inject } from "@loopback/core";
import { compare, genSalt, hash } from "bcryptjs"

export interface PasswordHasher<T=string>{
    hashPassword(password:T):Promise<T>
    comparePassword(providedPassword:T,storePassword :T):Promise<boolean>
}

export class BcryptHasher implements PasswordHasher<string>{
    async comparePassword(providedPassword: string, storePassword: string): Promise<boolean> {
        const passwordMatched= await compare(providedPassword,storePassword);
        return passwordMatched
    }

    @inject('rounds')
    rounds:number
    async hashPassword(password: string){
        const salt= await genSalt(this.rounds)
        return await hash(password,salt);
    }
}