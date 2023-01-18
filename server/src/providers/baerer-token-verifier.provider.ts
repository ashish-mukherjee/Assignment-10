import {securityId} from '@loopback/security';

import {Provider} from '@loopback/context';
import {service} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {VerifyFunction} from 'loopback4-authentication';
import {jwtService} from '../services/jwt.service';
import {UserRepository} from '../repositories';

export class BearerTokenVerifyProvider
  implements Provider<VerifyFunction.BearerFn>
{
  constructor(
    @service(jwtService)
    public jwtService: jwtService,
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) {}

  value(): VerifyFunction.BearerFn {
    return async token => {
      if (!token) {
        throw new HttpErrors.Unauthorized('Token needed for verification');
      }
      try {
        const UserProfile = await this.jwtService.verifyToken(token);
        var user = this.userRepository.findOne({
          where: {id: UserProfile[securityId]},
        });
      } catch {
        throw new HttpErrors.Unauthorized(
          `Error occcured while verifying toke`,
        );
      }
      return user;
    };
  }
}
