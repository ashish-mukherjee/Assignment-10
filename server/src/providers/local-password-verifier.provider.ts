import {Provider, service} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {AuthErrorKeys, VerifyFunction} from 'loopback4-authentication';
import {User} from '../models';
import {UserRepository} from '../repositories';
import {MyCustomUserService} from '../services/customUser.service';

export class LocalPasswordVerifyProvider
  implements Provider<VerifyFunction.LocalPasswordFn>
{
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @service(MyCustomUserService)
    public userService: MyCustomUserService,
  ) {}

  value(): VerifyFunction.LocalPasswordFn {
    return async (username: any, password: any) => {
      try {
        const user: User = await this.userService.verifyPassword(
          username,
          password,
        );

        return user;
      } catch (error) {
        throw new HttpErrors.Unauthorized(AuthErrorKeys.InvalidCredentials)
          .message;
      }
    };
  }
}
