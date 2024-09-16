FROM node:20-alpine

WORKDIR /nextjs

RUN apk add --no-cache ffmpeg

COPY . .

RUN npm install
RUN npm run build

CMD ["npm", "start"]