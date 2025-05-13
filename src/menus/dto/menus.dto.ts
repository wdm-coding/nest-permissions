import { PartialType } from '@nestjs/mapped-types'
export class CreateMenuDto {}

export class UpdateMenuDto extends PartialType(CreateMenuDto) {}
