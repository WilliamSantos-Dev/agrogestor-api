import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Group, Member } from '@prisma/client';
import { GroupsService } from 'src/groups/groups.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { MembersRepository } from './members.repository';

@Injectable()
export class MembersService {
  constructor(
    private readonly membersRepository: MembersRepository,
    private readonly groupsService: GroupsService,
  ) {}

  async create({
    name,
    groupName,
  }: CreateMemberDto): Promise<Member & { group: Group }> {
    const existing = await this.membersRepository.findByName(name);
    if (existing) throw new ConflictException();

    const group = await this.groupsService.getByNameOrCreate(groupName);

    return {
      ...(await this.membersRepository.create({ name, groupId: group.id })),
      group,
    };
  }

  async findByName(name: string) {
    const member = await this.membersRepository.findByName(name);
    let group: Group | undefined;
    if (member) {
      group = await this.groupsService.getById(member.groupId);
    }
    return member && group ? { ...member, group } : null;
  }

  async getById(id: number) {
    const member = await this.membersRepository.findById(id);
    if (!member) throw new NotFoundException();
    const group = await this.groupsService.getById(member.groupId);
    return { ...member, group };
  }

  async getByName(name: string) {
    const member = await this.membersRepository.findByName(name);
    if (!member) throw new NotFoundException();
    const group = await this.groupsService.getById(member.groupId);
    return { ...member, group };
  }

  async getOrCreate(createMemberDto: CreateMemberDto) {
    const member = await this.findByName(createMemberDto.name);
    if (!member) return this.create(createMemberDto);
    return member;
  }

  async listAll() {
    return this.membersRepository.listAll();
  }

  async update(id: number, { name, groupName }: UpdateMemberDto) {
    const current = await this.getById(id);

    if (name && name !== current.name) {
      const existing = await this.membersRepository.findByName(name);
      if (existing) throw new ConflictException();
    }

    let group: Group | undefined;
    if (groupName && groupName !== current.group.name) {
      const groupMembers = await this.membersRepository.listByGroupId(
        current.groupId,
      );
      if (!(groupMembers.length - 1)) {
        await this.groupsService.delete(current.groupId);
      }

      group = await this.groupsService.getByNameOrCreate(groupName);
    }
    group ??= current.group;

    return {
      ...(await this.membersRepository.update(id, {
        name,
        groupId: group?.id,
      })),
      group,
    };
  }

  async delete(id: number) {
    const current = await this.getById(id);

    const groupMembers = await this.membersRepository.listByGroupId(
      current.groupId,
    );
    if (!(groupMembers.length - 1)) {
      await this.groupsService.delete(current.groupId);
    }

    return this.membersRepository.delete(id);
  }
}
