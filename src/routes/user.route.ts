import express from 'express';

const router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.post('/sign-in', function (req, res, next) {});

export default router;
