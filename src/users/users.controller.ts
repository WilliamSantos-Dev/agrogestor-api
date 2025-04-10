import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiCreatedResponse({
    example: {
      name: 'User',
      id: 1,
      disabled: false,
      username: 'user',
      role: Role.USER,
    },
  })
  @ApiConflictResponse()
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  async create(@Body() createUserDto: CreateUserDto) {
    const { password, ...user } = await this.usersService.create(createUserDto);
    return user;
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOkResponse({
    example: {
      name: 'User',
      id: 1,
      disabled: false,
      username: 'user',
      role: Role.USER,
    },
  })
  @ApiConflictResponse()
  @ApiNotFoundResponse()
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  async update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    const { password, ...user } = await this.usersService.update(
      id,
      updateUserDto,
    );
    return user;
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOkResponse({
    example: {
      name: 'User',
      id: 1,
      disabled: false,
      username: 'user',
      role: Role.USER,
    },
  })
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  async delete(@Param('id') id: number) {
    const { password, ...user } = await this.usersService.delete(id);
    return user;
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOkResponse({
    description: 'Lista de usuários',
    schema: {
      example: [
        {
          name: 'Admin',
          id: 1,
          disabled: false,
          username: 'admin',
          role: Role.ADMIN,
        },
        {
          name: 'User',
          id: 2,
          disabled: false,
          username: 'user',
          role: Role.USER,
        },
      ],
    },
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map(({ password, ...user }) => user);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiOkResponse({
    example: {
      name: 'User',
      id: 1,
      disabled: false,
      username: 'user',
      role: Role.USER,
    },
  })
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  async findOne(@Param('id') id: number) {
    const { password, ...user } = await this.usersService.getById(id);
    return user;
  }
}
