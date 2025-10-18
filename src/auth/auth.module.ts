// src/auth/auth.module.ts
import {Module} from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';
import {PassportModule} from '@nestjs/passport';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {AuthService} from './auth.service';
import {JwtAuthGuard} from './guards/jwt-auth.guard';
import {RolesGuard} from './guards/roles.guard';
import {UsersModule} from "../users/users.module";
import {AuthController} from "./auth.controller";
import {LocalStrategy} from "./strategies/local.strategy";
import {JwtStrategy} from "./strategies/jwt.strategy";

@Module({
    imports: [
        UsersModule,
        PassportModule,
        JwtModule.registerAsync({
            global: true,
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: {
                    expiresIn: configService.get<number>('JWT_EXPIRES_IN') + 's',
                },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        LocalStrategy,
        JwtStrategy,
        JwtAuthGuard,
        RolesGuard,
    ],
    exports: [AuthService, JwtAuthGuard, RolesGuard, JwtModule],
})
export class AuthModule {
}
