import {Entity, model, property, hasMany} from '@loopback/repository';
import {User, UserWithRelations} from './user.model';

@model({name: 'customer', settings: {strict: true}})
export class Customer extends Entity {
  @property({
    type: 'string',
    id: true,
    defaultFn: 'uuidv4',
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      unique: true,
    },
  })
  name: string;

  @property({
    type: 'string',
  })
  website: string;

  @property({
    type: 'string',
  })
  address: string;

  @property({
    type: 'date',
    default: () => new Date(),
  })
  createdAt?: Date;

  @property({
    type: 'date',
    default: () => new Date(),
  })
  updatedAt?: Date;

  @hasMany(() => User)
  users: User[];

  constructor(data?: Partial<Customer>) {
    super(data);
  }
}

export interface CustomerRelations {
  // describe navigational properties here
  user?: UserWithRelations[];
}

export type CustomerWithRelations = Customer & CustomerRelations;
