import { ERegions } from '../../shared/enums/Regions';
import { UserEntity } from '../../user/entities/user.entity';

export interface IGuild {
  id?: string;
  name: string;
  description: string;
  owner: UserEntity;
  creator: UserEntity;
  region: ERegions;
  maximumMembersAllowed: number;
  createdAt?: Date;
  tags?: string[];
}
