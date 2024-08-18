import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>
  ){

  }

  async create(createProductDto: CreateProductDto) {
    
    try {
      const product = this.productRepository.create(createProductDto)
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      this.handleDBExceptions(error)  
    }

  }

  //TODO: PAGINAR
  async findAll() {
    try {
      return await this.productRepository.find({});
    } catch (error) {
      this.handleDBExceptions(error)  
    }
  }

  async findOne(id: number) {

    const product = await this.productRepository.findOneBy({id})
    if(!product)
      throw new NotFoundException(`Product with id ${id} nor found`);

  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }

  private handleDBExceptions(error: any) {
    if(error.code === "23505")
      throw new InternalServerErrorException(error.detail)
    
    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server log')
  
  }

}
