import {
    IsInt,
    IsUUID,
    Min,
} from 'class-validator';

export class CreateReservationDto {
    @IsUUID()
    eventId: string;

    @IsInt()
    @Min(1)
    quantity: number;
}