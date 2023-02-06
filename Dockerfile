FROM node:19 AS builder

# Create app directory
WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
COPY prisma ./prisma/
ENV PUPPETEER_SKIP_DOWNLOAD=1
# Install app dependencies
RUN npm install

COPY . .

RUN npm run build

FROM node:19 

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD [ "node", "dist/src/main"]