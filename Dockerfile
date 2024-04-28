FROM  node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173

# ENV MONGO_URL "mongodb+srv://Yashavant:_Devop_1234@cluster0.tjcvgkn.mongodb.net/?retryWrites=true&w=majority"

# ENV SecretKeyForCookieToken = "@_yash_mr_blogs_uhiuaibaibacij1u3293813981iiqs_iebi21g7t761619198@"

# ENV WEB_TOKEN = "JWT_token_MR_BLOGS"

# ENV ADMIN_KEY = "SECRET_ADMIN_KEY"

CMD ["npm", "run", "dev"]
