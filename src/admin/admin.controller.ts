import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto';
import { AdminService } from './admin.service';
import { AdminGuard } from 'src/auth/guard';

@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    console.log('=== [POST] /admin ===');
    console.log('CreateUserDto:', createUserDto);

    const result = await this.adminService.create(createUserDto);

    console.log('Create result:', result);
    return result;
  }

  @Get()
  async findAll() {
    console.log('=== [GET] /admin ===');

    const result = await this.adminService.findAll();

    console.log('FindAll result:', result);
    return result;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    console.log('=== [GET] /admin/:id ===');
    console.log('ID:', id);

    const result = await this.adminService.findOne(+id);

    console.log('FindOne result:', result);
    return result;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    console.log('=== [PATCH] /admin/:id ===');
    console.log('ID:', id);
    console.log('UpdateUserDto:', updateUserDto);

    const result = await this.adminService.update(+id, updateUserDto);

    console.log('Update result:', result);
    return result;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    console.log('=== [DELETE] /admin/:id ===');
    console.log('ID:', id);

    const result = await this.adminService.remove(+id);

    console.log('Remove result:', result);
    return result;
  }
}
