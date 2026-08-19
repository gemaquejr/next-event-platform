import {
    IsDateString,
    IsEnum,
    IsInt,
    IsNumber,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';

import { EventType } from '../../../generated/prisma/enums';

export class CreateEventDto {
    @IsOptional()
    @IsInt()
    @Min(1)
    tmdbMovieId?: number;

    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsEnum(EventType)
    type: EventType;

    @IsDateString()
    startAt: string;

    @IsOptional()
    @IsDateString()
    endAt?: string;

    @IsString()
    venue: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsInt()
    @Min(1)
    capacity: number;

    @IsNumber()
    @Min(0)
    ticketPrice: number;

    @IsString()
    slug: string;
}