import { ERegions } from '../../shared/enums/Regions';
import { UserEntity } from '../../user/entities/user.entity';
import { GuildMembershipEntity } from '../../guild-membership/entities/guild-membership.entity';

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
  memberships?: GuildMembershipEntity[];

  isFull(): boolean;
}
