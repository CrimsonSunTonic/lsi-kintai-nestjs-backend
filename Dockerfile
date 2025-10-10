FROM node:18-alpine
WORKDIR /app

COPY package*.json ./
# RUN npm ci
RUN npm install
# If you are using a custom Prisma client, uncomment the following line
RUN npm install prisma --save-dev
# If you are using ts-node for seeding, uncomment the following line
RUN npm install ts-node typescript @types/node --save-dev

COPY . .

RUN npx prisma generate
RUN npm run build

CMD ["/bin/sh", "/app/docker-entrypoint.sh"]