FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npx ts-node prisma/seed.ts
RUN npm run build
CMD [ "npm", "run", "start:dev" ]