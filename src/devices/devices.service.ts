// src/devices/devices.service.ts
import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException
} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {Device, DeviceDocument} from './schemas/device.schema';
import {CreateDeviceDto, UpdateDeviceDto, QueryDeviceDto} from './dto';

@Injectable()
export class DevicesService {
    constructor(
        @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
    ) {
    }

    async create(createDeviceDto: CreateDeviceDto): Promise<DeviceDocument> {
        const existingDevice = await this.deviceModel.findOne({
            name: createDeviceDto.name,
            brand: createDeviceDto.brand,
        });

        if (existingDevice) {
            throw new ConflictException(
                'Dispositivo já existe com este nome e marca'
            );
        }

        const payload: any = {...createDeviceDto};

        if (createDeviceDto.applicableDamageTypes) {
            payload.applicableDamageTypes = createDeviceDto.applicableDamageTypes.map((item: any) => ({
                damageType: item.id,
                defaultDiscountPercentage: item.defaultDiscountPercentage,
            }));
        }

        const device = new this.deviceModel(payload);
        return device.save();
    }

    async findAll(queryDto: QueryDeviceDto) {
        const {
            name,
            brand,
            model,
            minPrice,
            maxPrice,
            isActive,
            page = 1,
            limit = 10
        } = queryDto;

        const query: any = {};

        if (name) {
            query.name = {$regex: name, $options: 'i'};
        }

        if (brand) {
            query.brand = {$regex: brand, $options: 'i'};
        }

        if (model) {
            query.model = {$regex: model, $options: 'i'};
        }

        if (minPrice !== undefined || maxPrice !== undefined) {
            query.basePrice = {};
            if (minPrice !== undefined) query.basePrice.$gte = minPrice;
            if (maxPrice !== undefined) query.basePrice.$lte = maxPrice;
        }

        if (isActive !== undefined) {
            query.isActive = isActive;
        }

        const skip = (page - 1) * limit;

        const [devices, total] = await Promise.all([
            this.deviceModel
                .find(query)
                .populate({path: 'applicableDamageTypes.damageType', select: 'name description'})
                .sort({name: 1})
                .skip(skip)
                .limit(limit)
                .exec(),
            this.deviceModel.countDocuments(query),
        ]);

        return {
            data: devices,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findPublic(queryDto: QueryDeviceDto) {
        // Versão pública que só mostra dispositivos ativos
        const publicQuery = {...queryDto, isActive: true};
        return this.findAll(publicQuery);
    }

    async findById(id: string): Promise<DeviceDocument> {
        const device = await this.deviceModel
            .findById(id)
            .populate({path: 'applicableDamageTypes.damageType', select: 'name description'})
            .exec();

        if (!device) {
            throw new NotFoundException('Dispositivo não encontrado');
        }

        return device;
    }

    async findByIdPublic(id: string): Promise<DeviceDocument> {
        const device = await this.deviceModel
            .findOne({_id: id, isActive: true})
            .populate({path: 'applicableDamageTypes.damageType', select: 'name description'})
            .exec();

        if (!device) {
            throw new NotFoundException('Dispositivo não encontrado ou inativo');
        }

        return device;
    }

    async update(id: string, updateDeviceDto: UpdateDeviceDto): Promise<DeviceDocument> {
      // Verificar se não existe outro dispositivo com mesmo nome, marca e modelo
      if (updateDeviceDto.name || updateDeviceDto.brand) {
        const existingDevice = await this.deviceModel.findOne({
          name: updateDeviceDto.name || undefined,
          brand: updateDeviceDto.brand || undefined,
          _id: { $ne: id },
        });

        if (existingDevice) {
          throw new ConflictException(
            'Já existe outro dispositivo com este nome, marca e modelo'
          );
        }
      }

      const updatePayload: any = { ...updateDeviceDto } as any;
      if (updateDeviceDto.applicableDamageTypes) {
        updatePayload.applicableDamageTypes = updateDeviceDto.applicableDamageTypes.map((item: any) => ({
          damageType: item.id,
          defaultDiscountPercentage: item.defaultDiscountPercentage,
        }));
      }

      const device = await this.deviceModel.findByIdAndUpdate(
        id,
        updatePayload,
        { new: true, runValidators: true }
      ).populate({ path: 'applicableDamageTypes.damageType' });

      if (!device) {
        throw new NotFoundException('Dispositivo não encontrado');
      }

      return device;
    }

    async toggleActiveStatus(id: string): Promise<DeviceDocument> {
        const device = await this.deviceModel.findById(id);
        if (!device) {
            throw new NotFoundException('Dispositivo não encontrado');
        }

        device.isActive = !device.isActive;
        await device.save();

        return device;
    }

    async delete(id: string): Promise<void> {
        // TODO: Verificar se existem submissões associadas antes de excluir
        const result = await this.deviceModel.deleteOne({_id: id});

        if (result.deletedCount === 0) {
            throw new NotFoundException('Dispositivo não encontrado');
        }
    }

    async getStats() {
        const [total, active, avgPrice] = await Promise.all([
            this.deviceModel.countDocuments(),
            this.deviceModel.countDocuments({isActive: true}),
            this.deviceModel.aggregate([
                {$group: {_id: null, avgPrice: {$avg: '$basePrice'}}}
            ]),
        ]);

        const brands = await this.deviceModel.aggregate([
            {$group: {_id: '$brand', count: {$sum: 1}}},
            {$sort: {count: -1}},
            {$limit: 10}
        ]);

        return {
            total,
            active,
            inactive: total - active,
            averagePrice: avgPrice[0]?.avgPrice || 0,
            topBrands: brands,
        };
    }

    async findByBrand(brand: string) {
        return this.deviceModel
            .find({brand: new RegExp(brand, 'i'), isActive: true})
            .sort({name: 1})
            .exec();
    }

}
