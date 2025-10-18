import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DamageType, DamageTypeDocument } from '../../damage-types/schemas/damage-type.schema';
import * as bcrypt from 'bcryptjs';
import {User, UserDocument} from "../../users/user.schema";
import {Device, DeviceDocument} from "../../devices/schemas/device.schema";
import {PricingPolicy, PricingPolicyDocument} from "../../pricing-policies/schemas/pricing-policy.schema";
import {UserRole} from "../../common/enums/user-role.enum";
import {SaleMode} from "../../common/enums/sale-mode.enum";
import {PaymentTiming} from "../../common/enums/payment-timing.enum";

@Injectable()
export class InitialDataSeeder {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
        @InjectModel(DamageType.name) private damageTypeModel: Model<DamageTypeDocument>,
        @InjectModel(PricingPolicy.name) private pricingPolicyModel: Model<PricingPolicyDocument>,
    ) {}

    async run() {
        console.log('🌱 Iniciando seed dos dados...');

        await this.createUsers();
        await this.createDamageTypes();
        await this.createPricingPolicies();
        await this.createDevices();

        console.log('✅ Seed concluído com sucesso!');
    }

    private async createUsers() {
        const adminExists = await this.userModel.findOne({ role: UserRole.ADMIN });
        if (adminExists) return;

        const hashedPassword = await bcrypt.hash('admin123456', 12);

        await this.userModel.create({
            name: 'Administrador do Sistema',
            email: 'admin@sistema.com',
            password: hashedPassword,
            role: UserRole.ADMIN,
            isActive: true,
        });

        console.log('👤 Usuário admin criado: admin@sistema.com / admin123456');
    }

    private async createDamageTypes() {
        const damageTypes = [
            {
                name: 'Tela Trincada',
                description: 'Dispositivo com tela danificada ou rachada',
                defaultDiscountPercentage: 15,
                priority: 10,
            },
            {
                name: 'Bateria Viciada',
                description: 'Bateria com baixa autonomia ou não carrega',
                defaultDiscountPercentage: 10,
                priority: 8,
            },
            {
                name: 'Botões Defeituosos',
                description: 'Um ou mais botões não funcionam corretamente',
                defaultDiscountPercentage: 8,
                priority: 6,
            },
            {
                name: 'Câmera com Defeito',
                description: 'Problemas na câmera frontal ou traseira',
                defaultDiscountPercentage: 12,
                priority: 7,
            },
            {
                name: 'Arranhões Significativos',
                description: 'Marcas visíveis na carcaça ou tela',
                defaultDiscountPercentage: 5,
                priority: 3,
            },
            {
                name: 'Problemas de Áudio',
                description: 'Alto-falante, microfone ou fones não funcionam',
                defaultDiscountPercentage: 7,
                priority: 5,
            },
            {
                name: 'Oxidação/Água',
                description: 'Sinais de contato com líquidos',
                defaultDiscountPercentage: 25,
                priority: 12,
            },
        ];

        for (const damageType of damageTypes) {
            const exists = await this.damageTypeModel.findOne({ name: damageType.name });
            if (!exists) {
                await this.damageTypeModel.create(damageType);
            }
        }

        console.log('🔧 Tipos de avarias criados');
    }

    private async createPricingPolicies() {
        const policies = [
            // Modalidade Venda
            {
                name: 'Venda - 7 dias',
                saleMode: SaleMode.SALE,
                paymentTiming: PaymentTiming.SEVEN_DAYS,
                discountAmount: 250,
                description: 'Desconto de R$ 250 para recebimento em 7 dias',
                priority: 10,
            },
            {
                name: 'Venda - 10 dias',
                saleMode: SaleMode.SALE,
                paymentTiming: PaymentTiming.TEN_DAYS,
                discountAmount: 100,
                description: 'Desconto de R$ 100 para recebimento em 10 dias',
                priority: 8,
            },
            {
                name: 'Venda - 30 dias',
                saleMode: SaleMode.SALE,
                paymentTiming: PaymentTiming.THIRTY_DAYS,
                discountAmount: 0,
                description: 'Valor integral para recebimento em 30 dias',
                priority: 5,
            },
            // Modalidade Troca - valores integrais
            {
                name: 'Troca - Qualquer prazo',
                saleMode: SaleMode.EXCHANGE,
                paymentTiming: PaymentTiming.SEVEN_DAYS,
                discountAmount: 0,
                description: 'Valor integral para modalidade troca',
                priority: 12,
            },
        ];

        for (const policy of policies) {
            const exists = await this.pricingPolicyModel.findOne({
                saleMode: policy.saleMode,
                paymentTiming: policy.paymentTiming,
            });
            if (!exists) {
                await this.pricingPolicyModel.create(policy);
            }
        }

        console.log('💰 Políticas de preços criadas');
    }

    private async createDevices() {
        const devices = [
            {
                name: 'iPhone 13',
                brand: 'Apple',
                model: 'iPhone 13 128GB',
                basePrice: 3200,
                description: 'iPhone 13 com 128GB de armazenamento',
                specifications: [
                    'Tela Super Retina XDR de 6,1 polegadas',
                    '128GB de armazenamento',
                    'Câmera dupla de 12MP',
                    'Chip A15 Bionic',
                    'Resistente à água IP68'
                ],
            },
            {
                name: 'Galaxy S22',
                brand: 'Samsung',
                model: 'Galaxy S22 256GB',
                basePrice: 2800,
                description: 'Samsung Galaxy S22 com 256GB de armazenamento',
                specifications: [
                    'Tela Dynamic AMOLED 2X de 6,1 polegadas',
                    '256GB de armazenamento',
                    'Câmera tripla de até 50MP',
                    'Processador Snapdragon 8 Gen 1',
                    'Resistente à água IP68'
                ],
            },
            {
                name: 'Xiaomi 12',
                brand: 'Xiaomi',
                model: 'Mi 12 128GB',
                basePrice: 1800,
                description: 'Xiaomi Mi 12 com 128GB de armazenamento',
                specifications: [
                    'Tela AMOLED de 6,28 polegadas',
                    '128GB de armazenamento',
                    'Câmera tripla de 50MP',
                    'Snapdragon 8 Gen 1',
                    'Carregamento rápido de 67W'
                ],
            },
            {
                name: 'MacBook Air M1',
                brand: 'Apple',
                model: 'MacBook Air M1 256GB',
                basePrice: 7200,
                description: 'MacBook Air com chip M1 e 256GB SSD',
                specifications: [
                    'Chip Apple M1',
                    '8GB de RAM unificada',
                    '256GB SSD',
                    'Tela Retina de 13,3 polegadas',
                    'Até 18 horas de bateria'
                ],
            },
        ];

        for (const device of devices) {
            const exists = await this.deviceModel.findOne({
                brand: device.brand,
                model: device.model,
            });
            if (!exists) {
                await this.deviceModel.create(device);
            }
        }

        console.log('📱 Dispositivos de exemplo criados');
    }
}
