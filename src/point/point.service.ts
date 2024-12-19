import { Injectable, NotFoundException } from '@nestjs/common';
import { UserPointTable } from '../database/userpoint.table';
import { PointHistoryTable } from '../database/pointhistory.table';
import { TransactionType, PointHistory } from './point.model';

@Injectable()
export class PointService {
    constructor(
        private readonly userPointTable: UserPointTable,
        private readonly pointHistoryTable: PointHistoryTable,
    ) { }

    //user point 조회
    async getPoint(id: number) {
        const userPoint = await this.userPointTable.selectById(id);
        if (!userPoint) {
            throw new NotFoundException('No User Found');
        }
        return userPoint;
    }

    //user point history 조회
    async getPointHistory(id: number) {
        const history = await this.pointHistoryTable.selectAllByUserId(id);
        if (history.length === 0) {
            throw new NotFoundException('No History Found');
        }
        return history;
    }

    //user point 충전
    async chargePoint(id: number, amount: number) {
        let currentPoint = 0;
        const userPoint = await this.userPointTable.selectById(id);

        if (userPoint) currentPoint += userPoint.point;
        const updatedPoint = currentPoint + amount;

        await this.pointHistoryTable.insert(id, amount, TransactionType.CHARGE, Date.now());
        await this.userPointTable.insertOrUpdate(id, updatedPoint);

        const result = await this.userPointTable.selectById(id);
        console.log(result);
        return result;
    }

    //user point 사용
    async usePoint(id: number, amount: number) {
        const userPoint = await this.userPointTable.selectById(id);
        if (userPoint.point < amount) throw new Error('Not Enough Points');

        const updatedPoint = userPoint.point - amount;

        await this.pointHistoryTable.insert(id, -amount, TransactionType.USE, Date.now());
        await this.userPointTable.insertOrUpdate(id, updatedPoint);

        return await this.userPointTable.selectById(id);
    }

}