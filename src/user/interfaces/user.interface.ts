import { EGuildRoles } from '../../shared/enums/Guilds';

export interface IUser {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  guildRole: EGuildRoles;
  passwordHash?: string;
  emailVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
