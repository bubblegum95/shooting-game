import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import http from 'http';
import dotenv from 'dotenv';
import { AppModule } from './modules/app.module';

dotenv.config();

const app = express();
const port = process.env.SERVER_PORT;

app.set('port', port);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const httpServer = http.createServer(app);
const appModule = new AppModule(app, httpServer);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
