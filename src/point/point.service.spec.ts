import { Test, TestingModule } from '@nestjs/testing';
import { PointService } from './point.service';
import { UserPointTable } from '../database/userpoint.table';
import { PointHistoryTable } from '../database/pointhistory.table';
import { TransactionType } from './point.model';
import { NotFoundException } from '@nestjs/common';

describe('PointService', () => {
  let pointService: PointService;
  let userPointTable: UserPointTable;
  let pointHistoryTable: PointHistoryTable;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PointService,
        {
          provide: UserPointTable,
          useValue: {
            selectById: jest.fn(),
            insertOrUpdate: jest.fn(),
          },
        },
        {
          provide: PointHistoryTable,
          useValue: {
            selectAllByUserId: jest.fn(),
            insert: jest.fn(),
          },
        },
      ],
    }).compile();

    pointService = module.get<PointService>(PointService);
    userPointTable = module.get<UserPointTable>(UserPointTable);
    pointHistoryTable = module.get<PointHistoryTable>(PointHistoryTable);
  });

  describe('getPoint', () => {
    it.only('should return user point by user ID', async () => {
      const userId = 1;
      const userPoint = { id: 1, point: 100, updateMillis: Date.now() };
      jest.spyOn(userPointTable, 'selectById').mockResolvedValue(userPoint);

      const result = await pointService.getPoint(userId);
      expect(result).toEqual(userPoint);
      expect(userPointTable.selectById).toHaveBeenCalledWith(1);
    });
    it.only('user not found', async () => {
      const userId = 2;
      jest.spyOn(userPointTable, 'selectById').mockResolvedValue(null);

      await expect(pointService.getPoint(userId)).rejects.toThrow(NotFoundException);
      expect(userPointTable.selectById).toHaveBeenCalledWith(userId);
    });
  });

  describe('getPointHistory', () => {
    it('should return user point history', async () => {
      const userId = 1;
      const pointHistory = [
        { id: 1, userId: 1, type: TransactionType.CHARGE, amount: 100, timeMillis: Date.now() },
      ];
      jest.spyOn(pointHistoryTable, 'selectAllByUserId').mockResolvedValue(pointHistory);

      const result = await pointService.getPointHistory(userId);
      expect(result).toEqual(pointHistory);
      expect(pointHistoryTable.selectAllByUserId).toHaveBeenCalledWith(1);
    });
  });

  describe('chargePoint', () => {
    it('should charge user point', async () => {
      const userId = 1;
      const amount = 50;
      const userPoint = { id: 1, point: 100, updateMillis: Date.now() };
      const updatedUserPoint = { id: 1, point: 150, updateMillis: Date.now() };

      jest.spyOn(userPointTable, 'selectById').mockResolvedValueOnce(userPoint);
      jest.spyOn(userPointTable, 'insertOrUpdate').mockResolvedValue(undefined);
      jest.spyOn(pointHistoryTable, 'insert').mockResolvedValue(undefined);
      jest.spyOn(userPointTable, 'selectById').mockResolvedValueOnce(updatedUserPoint);

      const result = await pointService.chargePoint(userId, amount);
      expect(result).toEqual(updatedUserPoint);
      expect(userPointTable.selectById).toHaveBeenCalledWith(1);
      expect(userPointTable.insertOrUpdate).toHaveBeenCalledWith(1, 150);
      expect(pointHistoryTable.insert).toHaveBeenCalledWith(1, 150, TransactionType.CHARGE, expect.any(Number));
    });
  });
});