import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateGuildMembershipDto } from './dto/create-guild-membership.dto';
import { UpdateGuildMembershipDto } from './dto/update-guild-membership.dto';
import { GuildMembershipEntity } from './entities/guild-membership.entity';
import { In, Repository } from 'typeorm';
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
    const user = await this.findUserById(createGuildMembershipDto.userId);
    const guild = await this.findGuildById(createGuildMembershipDto.guildId);

    await this.checkGuildCapacity(guild);

    await this.checkExistingMembership(
      createGuildMembershipDto.userId,
      createGuildMembershipDto.guildId,
    );

    const newGuildMembership = this.guildMembershipRepository.create(createGuildMembershipDto);
    newGuildMembership.user = user;
    newGuildMembership.guild = guild;

    return this.guildMembershipRepository.save(newGuildMembership);
  }

  findAll() {
    return this.guildMembershipRepository.find({
      relations: ['user', 'guild'],
      select: {
        user: {
          id: true,
          firstName: true,
          lastName: true,
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

  async update(id: string, updateGuildMembershipDto: UpdateGuildMembershipDto) {
    await this.findMembershipById(id);
    await this.findUserById(updateGuildMembershipDto.userId);
    await this.findGuildById(updateGuildMembershipDto.guildId);
    return this.guildMembershipRepository.update(id, updateGuildMembershipDto);
  }

  async remove(id: string) {
    await this.findMembershipById(id);
    return this.guildMembershipRepository.delete(id);
  }

  async findAllByGuildId(guildId: string): Promise<GuildMembershipEntity[]> {
    const guild = await this.findGuildById(guildId);
    return await this.findMembershipsByGuild(guild);
  }

  async findAllByUserId(userId: string): Promise<GuildMembershipEntity[]> {
    const user = await this.findUserById(userId);
    return await this.findMembershipsByUser(user);
  }

  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //
  //                          Privates Functions                         //
  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //
  private async findUserById(userId: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return user;
  }

  private async findGuildById(guildId: string): Promise<GuildEntity> {
    const guild = await this.guildRepository.findOne({ where: { id: guildId } });
    if (!guild) {
      throw new NotFoundException(`Guild with ID ${guildId} not found`);
    }
    return guild;
  }

  private async findMembershipById(membershipId: string): Promise<GuildMembershipEntity> {
    const membership = await this.guildMembershipRepository.findOne({
      where: { id: membershipId },
    });
    if (!membership) {
      throw new NotFoundException(`Membership with ID ${membershipId} not found`);
    }
    return membership;
  }

  private async findMembershipsByGuild(guild: GuildEntity): Promise<GuildMembershipEntity[]> {
    const membership = await this.guildMembershipRepository.find({
      where: { guild: { id: guild.id } },
      relations: ['user'],
    });
    if (!membership) {
      throw new NotFoundException(`Membership with Guild ID ${guild.id} not found`);
    }
    return membership;
  }

  private async findMembershipsByUser(user: UserEntity): Promise<GuildMembershipEntity[]> {
    const membership = await this.guildMembershipRepository.find({
      where: { user: { id: user.id } },
      relations: ['user'],
    });
    if (!membership) {
      throw new NotFoundException(`Memberships for User ID ${user.id} not found`);
    }
    return membership;
  }

  private async checkGuildCapacity(guild: GuildEntity): Promise<void> {
    const activeMembers = await this.getActiveGuildMemberships(guild.id);

    if (activeMembers.length >= guild.maximumMembersAllowed) {
      throw new BadRequestException('Guild is full');
    }
  }

  private async getActiveGuildMemberships(guildId: string): Promise<GuildMembershipEntity[]> {
    return this.guildMembershipRepository.find({
      where: {
        guild: { id: guildId },
        status: EGuildStatus.ACTIVE,
      },
    });
  }

  private async checkExistingMembership(userId: string, guildId: string): Promise<void> {
    const existingMembership = await this.guildMembershipRepository.findOne({
      where: {
        user: { id: userId },
        guild: { id: guildId },
        status: In([EGuildStatus.PENDING, EGuildStatus.ACTIVE, EGuildStatus.INVITED]),
      },
    });

    if (existingMembership) {
      throw new BadRequestException(
        `User is already a member of this guild or has a pending request for the guild with id : ${guildId}`,
      );
    }
  }
}
