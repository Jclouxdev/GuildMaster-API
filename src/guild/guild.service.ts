import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGuildDto } from './dto/create-guild.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { Like, Repository } from 'typeorm';
import { GuildEntity } from './entities/guild.entity';
import { ERegions } from '../shared/enums/Regions';

@Injectable()
export class GuildService {
  constructor(
    @InjectRepository(GuildEntity)
    private guildsRepository: Repository<GuildEntity>,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  async create(createGuildDto: CreateGuildDto): Promise<GuildEntity> {
    const user = await this.usersRepository.findOne({
      where: { id: createGuildDto.ownerId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const newGuildBuilder: GuildEntity = new GuildEntity();
    newGuildBuilder.name = createGuildDto.name;
    newGuildBuilder.description = createGuildDto.description;
    newGuildBuilder.owner = user;

    if (createGuildDto.creatorId) {
      const creator = await this.usersRepository.findOne({
        where: { id: createGuildDto.creatorId },
      });

      if (!creator) {
        throw new Error('Creator not found');
      }

      newGuildBuilder.creator = creator;
    }

    newGuildBuilder.region = createGuildDto.region;
    newGuildBuilder.maximumMembersAllowed = createGuildDto.maximumMembersAllowed;
    newGuildBuilder.tags = createGuildDto.tags;

    const guild = this.guildsRepository.create(newGuildBuilder);
    return this.guildsRepository.save(guild);
  }

  async findAll(): Promise<GuildEntity[]> {
    return await this.guildsRepository.find({
      relations: ['owner', 'creator'],
      select: {
        owner: {
          id: true,
          username: true,
          email: true,
        },
        creator: {
          id: true,
          username: true,
          email: true,
        },
      },
    });
  }

  findOneById(id: string): Promise<GuildEntity> {
    const guild = this.guildsRepository.findOne({
      where: { id },
      relations: ['owner', 'creator'],
      select: {
        owner: {
          id: true,
          username: true,
          email: true,
        },
        creator: {
          id: true,
          username: true,
          email: true,
        },
      },
    });

    if (!guild) {
      throw new NotFoundException('Guild not found');
    }

    return guild;
  }

  findByName(name: string): Promise<GuildEntity[]> {
    return this.guildsRepository.find({
      where: { name: Like(`%${name}%`) },
      relations: ['owner', 'creator'],
      select: {
        owner: {
          id: true,
          username: true,
          email: true,
        },
        creator: {
          id: true,
          username: true,
          email: true,
        },
      },
    });
  }

  findByRegion(region: ERegions): Promise<GuildEntity[]> {
    if (!Object.values(ERegions).includes(region)) {
      throw new NotFoundException('Region not found');
    }

    return this.guildsRepository.find({
      where: { region },
      relations: ['owner', 'creator'],
      select: {
        owner: {
          id: true,
          username: true,
          email: true,
        },
        creator: {
          id: true,
          username: true,
          email: true,
        },
      },
    });
  }

  // update(id: number, updateGuildDto: UpdateGuildDto) {
  //   return `This action updates a #${id} guild`;
  // }

  async remove(id: string): Promise<void> {
    try {
      await this.guildsRepository.delete(id);
      return;
    } catch (error) {
      throw new NotFoundException(`Guild ${error} not found`);
    }
  }
}
