import express, { CookieOptions } from 'express';
import { UserService } from '../services/user.service';
import { ModuleInitLog, logger } from '../winston';

export class UserModule {
  constructor(private readonly userService: UserService) {
    logger.info(ModuleInitLog, { filename: 'UserModule' });
  }

  getRouter() {
    const router = express.Router();

    router.post('/sign-up', async (req, res, next) => {
      try {
        const result = await this.userService.signUp(req.body);
        if (!result) {
          throw new Error('계정을 생성할 수 없습니다.');
        }
        res.status(201).json({ message: '회원가입을 완료하였습니다.' });
      } catch (error) {
        next(error);
      }
    });

    router.post('/sign-in', async (req, res, next) => {
      try {
        const token = await this.userService.signIn(req.body);
        if (!token) {
          throw new Error('로그인 할 수 없습니다.');
        }
        const options: CookieOptions = {
          secure: true,
          sameSite: 'none',
          httpOnly: true,
        };
        res.cookie('authorization', `Bearer ${token}`, options);
        res.status(201).json({ message: '로그인을 완료하였습니다.' });
      } catch (error) {
        next(error);
      }
    });

    return router;
  }
}
