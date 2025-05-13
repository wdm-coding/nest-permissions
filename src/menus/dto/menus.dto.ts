import { PartialType } from '@nestjs/mapped-types'
import { Expose } from 'class-transformer'
import { IsNotEmpty, IsOptional, IsString } from 'class-validator'
export class CreateMenuDto {
  @Expose()
  @IsOptional()
  id: number
  @Expose()
  @IsNotEmpty()
  @IsString()
  name: string
  @IsNotEmpty()
  @IsString()
  path: string
  @IsNotEmpty()
  @IsString()
  path_key: string
  @IsNotEmpty()
  icon: string
  @IsNotEmpty()
  order: number
  @IsOptional()
  acl: string
  @IsOptional()
  description: string
}

export class UpdateMenuDto extends PartialType(CreateMenuDto) {}
