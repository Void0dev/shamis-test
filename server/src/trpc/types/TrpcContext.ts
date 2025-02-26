import { Request, Response } from 'express';
import { User } from '../../user/user.entity';

export type TrpcContextPublic = {
  req: Request;
  res: Response;
};

export type TrpcContextProtected = {
  req: Request;
  res: Response;
  user: User;
};

export type TrpcContext = TrpcContextPublic | TrpcContextProtected;
