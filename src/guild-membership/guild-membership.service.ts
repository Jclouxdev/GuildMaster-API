import { Injectable } from '@nestjs/common';
import { CreateGuildMembershipDto } from './dto/create-guild-membership.dto';
import { UpdateGuildMembershipDto } from './dto/update-guild-membership.dto';
import { GuildMembershipEntity } from './entities/guild-membership.entity';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { GuildEntity } from '../guild/entities/guild.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EGuildRoles, EGuildStatus } from '../shared/enums/Guilds';

@Injectable()
export class GuildMembershipService {
  constructor(
    @InjectRepository(GuildMembershipEntity)
    private readonly guildMembershipRepository: Repository<GuildMembershipEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(GuildEntity)
    private readonly guildRepository: Repository<GuildEntity>,
  ) {}

  async create(createGuildMembershipDto: CreateGuildMembershipDto): Promise<GuildMembershipEntity> {
    const newGuildMembership = this.guildMembershipRepository.create(createGuildMembershipDto);
    const user = await this.userRepository.findOne({
      where: { id: createGuildMembershipDto.userId },
    });
    if (!user) {
      throw new Error('User not found');
    }

    const guild = await this.guildRepository.findOne({
      where: { id: createGuildMembershipDto.guildId },
    });
    if (!guild) {
      throw new Error('Guild not found');
    }
    const getActiveMemberships = await this.getActiveGuildMemberships(
      createGuildMembershipDto.guildId,
    );
    if (getActiveMemberships.length >= guild.maximumMembersAllowed) {
      throw new Error('Guild is full');
    }

    const existingMembership = await this.guildMembershipRepository.findOne({
      where: {
        user: { id: createGuildMembershipDto.userId },
        guild: { id: createGuildMembershipDto.guildId },
        status: EGuildStatus.PENDING || EGuildStatus.ACTIVE || EGuildStatus.INVITED,
      },
    });
    if (existingMembership) {
      throw new Error('User is already a member of this guild or has a pending request');
    }

    newGuildMembership.user = user;
    newGuildMembership.guild = guild;

    return this.guildMembershipRepository.save(newGuildMembership);
  }

  private async getActiveGuildMemberships(guildId: string): Promise<GuildMembershipEntity[]> {
    return this.guildMembershipRepository.find({
      where: {
        guild: { id: guildId },
        status: EGuildStatus.ACTIVE,
      },
    });
  }

  findAll() {
    return this.guildMembershipRepository.find({
      relations: ['user', 'guild'],
      select: {
        user: {
          id: true,
          username: true,
          email: true,
        },
        guild: {
          id: true,
          name: true,
          description: true,
        },
      },
    });
  }

  async update(id: number, updateGuildMembershipDto: UpdateGuildMembershipDto) {
    const guildMembership = await this.guildMembershipRepository.findOne({ where: { id } });
    if (!guildMembership) {
      throw new Error('Guild membership not found');
    }
    if (!(await this.doesUserExist(updateGuildMembershipDto.userId))) {
      throw new Error('User not found');
    }
    if (!(await this.doesGuildExist(updateGuildMembershipDto.guildId))) {
      throw new Error('Guild not found');
    }
    return this.guildMembershipRepository.update(id, updateGuildMembershipDto);
  }

  async remove(id: number) {
    const guildMembership = await this.guildMembershipRepository.findOne({ where: { id } });
    if (!guildMembership) {
      throw new Error('Guild membership not found');
    }
    return this.guildMembershipRepository.delete(id);
  }

  //TODO: remove user condition when login is implemented
  async findAllByGuild(guildId: string, userId?: string): Promise<GuildMembershipEntity[]> {
    if (!(await this.doesGuildExist(guildId))) {
      throw new Error('Guild not found');
    }
    if (userId && !(await this.doesUserExist(userId))) {
      throw new Error('User not found');
    }

    const guildMemberships = await this.guildMembershipRepository.find({
      where: {
        guild: { id: guildId },
      },
      relations: ['user'],
    });
    if (!guildMemberships) {
      throw new Error('No memberships found for this guild');
    }

    if (userId) {
      const isMember = guildMemberships.some(membership => membership.user.id === userId);
      if (!isMember) {
        throw new Error('User is not a member of this guild');
      }
    }
    if (userId && !(await this.isUserAuthorizedToViewMemberships(userId, guildId))) {
      throw new Error('User is not authorized to view this guild membership');
    }

    return guildMemberships;
  }

  async findAllByUser(userId: string, requestUserId: string): Promise<GuildMembershipEntity[]> {
    if (userId !== requestUserId) {
      throw new Error('User is not authorized to view theses guild memberships');
    }
    if (!(await this.doesUserExist(userId))) {
      throw new Error('User not found');
    }
    const guildMemberships = await this.guildMembershipRepository.find({
      where: {
        user: { id: userId },
      },
      relations: ['user', 'guild'],
    });
    if (!guildMemberships) {
      throw new Error('No memberships found for this user');
    }
    return guildMemberships;
  }

  // Utilities functions
  private async doesGuildExist(guildId: string): Promise<boolean> {
    const guild = await this.guildRepository.findOne({ where: { id: guildId } });
    return !!guild;
  }

  private async doesUserExist(userId: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    return !!user;
  }

  private async isUserAuthorizedToViewMemberships(
    userId: string,
    guildId: string,
  ): Promise<boolean> {
    const guildMembership = await this.guildMembershipRepository.findOne({
      where: {
        user: { id: userId },
        guild: { id: guildId },
      },
    });
    return (
      guildMembership &&
      (guildMembership.role === EGuildRoles.GUILD_MASTER ||
        guildMembership.role === EGuildRoles.OFFICIER)
    );
  }
}
