import { BadRequestException, Body, Controller, Get, Param, Patch, ValidationPipe, Post, UsePipes } from "@nestjs/common";
import { PointHistory, TransactionType, UserPoint } from "./point.model";
import { UserPointTable } from "src/database/userpoint.table";
import { PointHistoryTable } from "src/database/pointhistory.table";
import { PointBody as PointDto, IdParam } from "./point.dto";
import { PointService } from './point.service';

@Controller('/point')
export class PointController {
    constructor(private readonly pointService: PointService) {}

    /**
     * TODO - 특정 유저의 포인트를 조회하는 기능을 작성해주세요.
     */
    @Get(':id')
    @UsePipes(new ValidationPipe({ transform: true }))
    async point(@Param() params: IdParam): Promise<UserPoint> {
        return await this.pointService.getPoint(params.id);
    }

    /**
     * TODO - 특정 유저의 포인트 충전/이용 내역을 조회하는 기능을 작성해주세요.
     */
    @Get(':id/histories')
    @UsePipes(new ValidationPipe({ transform: true }))
    async history(@Param() params: IdParam): Promise<PointHistory[]> {
        return await this.pointService.getPointHistory(params.id);
    }

    /**
     * TODO - 특정 유저의 포인트를 충전하는 기능을 작성해주세요.
     */
    @Patch(':id/charge')
    @UsePipes(new ValidationPipe({ transform: true }))
    async charge(
        @Param() params: IdParam,
        @Body(ValidationPipe) pointDto: PointDto,
    ): Promise<UserPoint> {
        return await this.pointService.chargePoint(params.id, pointDto.amount);
    }

    /**
     * TODO - 특정 유저의 포인트를 사용하는 기능을 작성해주세요.
     */
    @Post('use/:id')
    @UsePipes(new ValidationPipe({ transform: true }))
    async usePoint(@Param() params: IdParam, @Body('amount') amount: number) {
        return await this.pointService.usePoint(params.id, amount);
    }
}