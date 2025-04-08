import { ERegions } from '../../shared/enums/Regions';

export interface IUser {
  id?: string;
  username: string;
  email: string;
  region: ERegions[];
  createdAt?: Date;
  updatedAt?: Date;
}
