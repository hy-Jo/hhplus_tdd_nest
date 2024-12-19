import { IsInt, Min } from "class-validator";

export class PointBody {
    @IsInt({ message: 'The amount must be an integer.' })
    @Min(1, { message: 'The amount must be greater than 0.' })
    amount: number;
}

export class IdParam {
    @IsInt({ message: 'The ID must be an integer.' })
    @Min(0, { message: 'The ID must be a non-negative integer.' })
    id: number;
}