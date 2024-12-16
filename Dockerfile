FROM node:18

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 4000

RUN npm run build

CMD ["npm", "run", "start"]