import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto';
import { AdminService } from './admin.service';
import { AdminGuard } from 'src/auth/guard';

@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) {}

    @Post()
    create(@Body() createUserDto: CreateUserDto) {
        return this.adminService.create(createUserDto);
    }

    @Get()
    findAll() {
        return this.adminService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.adminService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.adminService.update(+id, updateUserDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.adminService.remove(+id);
    }
}
