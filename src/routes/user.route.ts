import express, { CookieOptions } from 'express';
import { UserService } from '../services/user.service';
import { ModuleInitLog, logger } from '../winston';
import { SignUpDto } from '../dto/sign-up.dto';
import { SignInDto } from '../dto/sign-in.dto';

export class UserRoute {
  constructor(private readonly userService: UserService) {
    logger.info(ModuleInitLog, { filename: 'UserRouter' });
  }

  init() {
    const router = express.Router();

    router.post('/sign-up', async (req, res, next) => {
      try {
        const dto = req.body;
        if (!dto) {
          throw new Error('dto 없음');
        }
        const { error, value } = SignUpDto.validate(dto);
        if (error) {
          throw new Error(`${error}: ${value}`);
        }
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
        const dto = req.body;
        if (!dto) {
          throw new Error('dto 없음');
        }
        const { error, value } = SignInDto.validate(dto);
        if (error) {
          throw new Error(`${error}: ${value}`);
        }
        const result = await this.userService.signIn(dto);
        const options: CookieOptions = {
          secure: true,
          sameSite: 'none',
          httpOnly: true,
        };
        res.cookie('authorization', `Bearer ${result.token}`);
        res.status(200).json({
          message: '로그인을 완료하였습니다.',
          token: `Bearer ${result.token}`,
          userId: result.userId,
        });
      } catch (error) {
        next(error);
      }
    });

    return router;
  }
}
