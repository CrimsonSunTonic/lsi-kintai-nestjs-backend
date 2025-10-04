import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './strategy';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({
      // secret: 'your_jwt_secret_key', // Replace with your secret key
      // signOptions: { expiresIn: '1h' }, // Token expiration time
  })],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy]
})
export class AuthModule {}
