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
    async getPoint(id: string) {
        const userId = Number.parseInt(id);
        const userPoint = await this.userPointTable.selectById(userId);
        return userPoint;
    }

    //user point history 조회
    async getPointHistory(id: string) {
        const userId = Number.parseInt(id);
        const pointHistory = await this.pointHistoryTable.selectAllByUserId(userId);
        return pointHistory;
    }

    //user point 충전
    async chargePoint(id: string, amount: number) {
        const userId = Number.parseInt(id);
        const userPoint = await this.userPointTable.selectById(userId);
        const updatedPoint = userPoint.point + amount;

        await this.userPointTable.insertOrUpdate(userId, updatedPoint);
        await this.pointHistoryTable.insert(userId, updatedPoint, TransactionType.CHARGE, Date.now());

        return await this.userPointTable.selectById(userId);
    }

    //user point 사용
    async usePoint(id: string, amount: number) {
        const userId = Number.parseInt(id);

        if (amount <= 0) throw new Error('Invalid Amount');
        const userPoint = await this.userPointTable.selectById(userId);
        if (userPoint.point < amount) throw new Error('Not enough point');

        const newPoint = userPoint.point - amount;

        await this.userPointTable.insertOrUpdate(userId, newPoint);
        await this.pointHistoryTable.insert(userId, amount, TransactionType.USE, Date.now());

        return await this.userPointTable.selectById(userId);
    }

}