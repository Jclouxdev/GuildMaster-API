import { Injectable } from '@nestjs/common';
import { CreateGuildDto } from './dto/create-guild.dto';
import { UpdateGuildDto } from './dto/update-guild.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { GuildEntity } from './entities/guild.entity';

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

  // findOne(id: number) {
  //   return `This action returns a #${id} guild`;
  // }
  //
  // update(id: number, updateGuildDto: UpdateGuildDto) {
  //   return `This action updates a #${id} guild`;
  // }
  //
  // remove(id: number) {
  //   return `This action removes a #${id} guild`;
  // }
}
