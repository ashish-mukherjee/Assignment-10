import { HttpErrors } from '@loopback/rest';
import { inject } from "@loopback/core";
import { repository } from "@loopback/repository";
import { User } from "../models/user.model";
import { UserRepository } from "../repositories";
import {BcryptHasher} from './hash.password.bcrypt';

export class MyCustomUserService{
    constructor(@repository(UserRepository)
    public userRepository:UserRepository,
    @inject('hash.password.bcrypt')
    public hasher:BcryptHasher
    ){}

    async verifyPassword(username:string,password:string):Promise<User>{
        const foundUser:User|null=await this.userRepository.findOne({
            where:{
                username
            }
        });

        if(!foundUser){
            throw new HttpErrors.NotFound(`user not found with this ${username}`);
        }
        const passwordMatched = await this.hasher.comparePassword(password,foundUser.password!);

        if(!passwordMatched){
            throw new HttpErrors.Unauthorized('Password doesnt matches');
        }

        return foundUser;
    }
}