# Stage 1: Build
FROM node:18 AS build

WORKDIR /app

# Salin hanya file yang diperlukan dulu (agar cache lebih efisien)
COPY package*.json ./

# Install dependencies
RUN npm install

# Salin semua source code (pastikan tidak ada node_modules dari host)
COPY . .

# Jalankan build Next.js
RUN npm run build

# Stage 2: Production image
FROM node:18-alpine

WORKDIR /app

# Copy hasil build dari stage sebelumnya
COPY --from=build /app .

EXPOSE 3000

CMD ["npm", "start"]
