import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto';
import { AdminService } from './admin.service';
import { AdminGuard } from 'src/auth/guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User successfully created' })
  async create(@Body() createUserDto: CreateUserDto) {
    console.log('=== [POST] /admin ===');
    console.log('CreateUserDto:', createUserDto);
    const result = await this.adminService.create(createUserDto);
    return result;
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Returns all users' })
  async findAll() {
    console.log('=== [GET] /admin ===');
    const result = await this.adminService.findAll();
    return result;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Returns user data' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string) {
    console.log('=== [GET] /admin/:id ===');
    console.log('ID:', id);
    const result = await this.adminService.findOne(+id);
    return result;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User successfully updated' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    console.log('=== [PATCH] /admin/:id ===');
    console.log('ID:', id);
    console.log('UpdateUserDto:', updateUserDto);
    const result = await this.adminService.update(+id, updateUserDto);
    return result;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User successfully deleted' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@Param('id') id: string) {
    console.log('=== [DELETE] /admin/:id ===');
    console.log('ID:', id);
    const result = await this.adminService.remove(+id);
    return result;
  }
}