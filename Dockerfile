FROM node:18

WORKDIR /app

COPY package.json ./package.json

COPY tsconfig.json ./tsconfig.json

RUN npm install

EXPOSE 4000

CMD ["npm", "start:dev"]