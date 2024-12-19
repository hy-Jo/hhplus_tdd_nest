import { Injectable } from '@nestjs/common';
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
        return await this.userPointTable.selectById(id);
  
    }

    //user point history 조회
    async getPointHistory(id: number) {
        const pointHistory = await this.pointHistoryTable.selectAllByUserId(id);
        return pointHistory;
    }

    //user point 충전
    async chargePoint(id: number, amount: number) {
        const userPoint = await this.userPointTable.selectById(id);
        const updatedPoint = userPoint.point + amount;

        await this.userPointTable.insertOrUpdate(id, updatedPoint);
        await this.pointHistoryTable.insert(id, updatedPoint, TransactionType.CHARGE, Date.now());

        return await this.userPointTable.selectById(id);
    }

    //user point 사용
    async usePoint(id: number, amount: number) {
        if (amount <= 0) throw new Error('Invalid Amount');
        const userPoint = await this.userPointTable.selectById(id);
        if (userPoint.point < amount) throw new Error('Not enough point');

        const newPoint = userPoint.point - amount;

        await this.userPointTable.insertOrUpdate(id, newPoint);
        await this.pointHistoryTable.insert(id, amount, TransactionType.USE, Date.now());
        id
        return await this.userPointTable.selectById(id);
    }

}