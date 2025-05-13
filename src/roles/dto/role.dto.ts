import { Expose } from 'class-transformer'
import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateRoleDto {
  @Expose()
  @IsOptional()
  id: number
  @Expose()
  @IsString()
  @IsNotEmpty()
  name: string
  @IsString()
  @IsNotEmpty()
  code: string
  @IsOptional()
  description: string
}

import { PartialType } from '@nestjs/mapped-types'

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}
