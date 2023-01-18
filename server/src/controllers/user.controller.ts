import {inject, service} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
  SchemaObject,
} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {
  authenticate,
  AuthenticationBindings,
  STRATEGY,
} from 'loopback4-authentication';
import {User} from '../models';
import {UserRepository} from '../repositories';
import {BcryptHasher} from '../services/hash.password.bcrypt';
import {jwtService} from '../services/jwt.service';

const CredentialSchema: SchemaObject = {
  type: 'object',
  required: ['username', 'password'],
  properties: {
    username: {
      type: 'string',
    },
    password: {
      type: 'string',
    },
  },
};

export const LoginRequestBody = {
  description: 'Login Endpoint inputs',
  required: true,
  content: {
    'application/json': {
      schema: CredentialSchema,
    },
  },
};

export class UserController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @service(jwtService)
    public jwtService: jwtService,
    @inject('hash.password.bcrypt')
    public hasher: BcryptHasher,
  ) {}

  @authenticate(STRATEGY.LOCAL)
  @post('/users/login', {
    responses: {
      '200': {
        content: {
          'application/json': {
            schema: {
              type: 'object',
            },
          },
        },
      },error: { statusCode: 500, message: 'Internal Server Error' } 
    },
  })
  async login(
    @requestBody(LoginRequestBody)
    credentials: {
      username: 'string';
      password: 'string';
    },
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: User,
  ): Promise<{token: string}> {
    console.log('credentials', credentials);
    console.log('logged in user', currentUser);
    const user: UserProfile = {
      [securityId]: currentUser.id!.toString(),
      id: currentUser.id,
      username: currentUser.username,
      firstname: currentUser.firstName,
    };
    const token = await this.jwtService.generateToken(user);
    return {token};
  }

  @post('/users')
  @response(200, {
    description: 'User model instance',
    content: {'application/json': {schema: getModelSchemaRef(User)}},
  },{ error: { statusCode: 500, message: 'Not authenticated' } })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {
            title: 'NewUser',
            exclude: ['id'],
          }),
        },
      },
    })
    user: Omit<User, 'id'>,
  ): Promise<User> {
    user.password = await this.hasher.hashPassword(user.password!);
    return this.userRepository.create(user);
  }

  @authenticate(STRATEGY.BEARER)
  @get('/users/count')
  @response(200, {
    description: 'User model count',
    content: {'application/json': {schema: CountSchema}},
  },{ error: { statusCode: 500, message: 'Internal Server Error' } })
  async count(@param.where(User) where?: Where<User>): Promise<Count> {
    return this.userRepository.count(where);
  }

  @authenticate(STRATEGY.BEARER)
  @get('/users')
  @response(200, {
    description: 'Array of User model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(User, {includeRelations: true}),
        },
      },
    },
  },{ error: { statusCode: 500, message: 'Not authenticated' } })
  async find(@param.filter(User) filter?: Filter<User>): Promise<User[]> {
    return this.userRepository.find({include: ['customer', 'role']});
  }

  @authenticate(STRATEGY.BEARER)
  @patch('/users')
  @response(200, {
    description: 'User PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  },{ error: { statusCode: 500, message: 'Not authenticated' } })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    user: User,
    @param.where(User) where?: Where<User>,
  ): Promise<Count> {
    return this.userRepository.updateAll(user, where);
  }

  @authenticate(STRATEGY.BEARER)
  @get('/users/{id}')
  @response(200, {
    description: 'User model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(User, {includeRelations: true}),
      },
    },
  },{ error: { statusCode: 500, message: 'Not authenticated' } })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(User, {exclude: 'where'}) filter?: FilterExcludingWhere<User>,
  ): Promise<User> {
    return this.userRepository.findById(id, filter);
  }

  @authenticate(STRATEGY.BEARER)
  @patch('/users/{id}')
  @response(204, {
    description: 'User PATCH success',
  },{ error: { statusCode: 500, message: 'Not authenticated' } })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    user: User,
  ): Promise<void> {
    user.updatedAt = new Date();
    await this.userRepository.updateById(id, user);
  }

  @authenticate(STRATEGY.BEARER)
  @put('/users/{id}')
  @response(204, {
    description: 'User PUT success',
  },{ error: { statusCode: 500, message: 'Not authenticated' } })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() user: User,
  ): Promise<void> {
    await this.userRepository.replaceById(id, user);
  }

  @authenticate(STRATEGY.BEARER)
  @del('/users/{id}')
  @response(204, {
    description: 'User DELETE success',
  },{ error: { statusCode: 500, message: 'Not authenticated' } })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.userRepository.deleteById(id);
  }
}
