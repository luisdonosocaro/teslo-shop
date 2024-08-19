import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

import * as bcrypt from 'bcrypt'; //encriptar contraseña
import { CreateUserDto, LoginUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ){}

  async create(createUserDto: CreateUserDto) {
  
    try {
      
      const {password, ...userData} = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10)   //internamente hace la contraseña aleatoria
      });
      await this.userRepository.save(user);
      delete user.password;

      return {
        ...user,
        token: this.getJwToken({id: user.id})
      };
  
      //TODO: retornar JWT de acceso

    } catch (error) {
      this.handleDBError(error)
    }
  
  }

  async login(loginUserDto: LoginUserDto){

    const {password, email} = loginUserDto;
    const user = await this.userRepository.findOne({
      where: {email},
      select: {email: true, password: true, id: true}
    });

    if(!user)
      throw new UnauthorizedException(`Unauthorized credentials`);

    if(!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException(`Unauthorized credentials`);

    return {
      ...user,
      token: this.getJwToken({id: user.id})
    };

    //TODO: retornar JWT

/*     try {
      
    } catch (error) {
      this.handleDBError(error)
    }
 */
  }


  private getJwToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }



  private handleDBError(error: any): never {
    if(error.code === '23505'){
      throw new BadRequestException(error.detail)
    }
    console.log(error);
    throw new InternalServerErrorException('Please check logs');
  }


}
