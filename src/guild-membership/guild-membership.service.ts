import { Injectable } from '@nestjs/common';
import { CreateGuildMembershipDto } from './dto/create-guild-membership.dto';
import { UpdateGuildMembershipDto } from './dto/update-guild-membership.dto';
import { GuildMembershipEntity } from './entities/guild-membership.entity';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { GuildEntity } from '../guild/entities/guild.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EGuildStatus } from '../shared/enums/Guilds';

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

  findOne(id: number) {
    return `This action returns a #${id} guildMembership`;
  }

  update(id: number, updateGuildMembershipDto: UpdateGuildMembershipDto) {
    return `This action updates a #${id} guildMembership`;
  }

  remove(id: number) {
    return `This action removes a #${id} guildMembership`;
  }
}
