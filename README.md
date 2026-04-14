Backend System: JWT Auth + Redis + Rate Limiting + OTP Service

A production-style backend built using Node.js, Express, JWT, and Redis implementing authentication, session management, rate limiting, and OTP verification using Redis data structures.

🔥 Features
🔐 Authentication
JWT Access Token (short-lived)
Refresh Token stored in Redis (server-controlled sessions)
Secure login/logout flow
Token invalidation using Redis

📩 OTP System
OTP generation using backend
Stored in Redis
Auto-expire after 5 minutes (TTL)
OTP verification system
⚡ Rate Limiting

Sliding Window algorithm using Redis Sorted Sets (ZSET)
Prevents API abuse
Time-based request tracking

🧠 System Architecture
Client
  ↓
Express API
  ↓
Redis (Sessions + OTP + Rate Limiter)
  ↓
JWT Auth Layer
📦 Tech Stack
Node.js
Express.js
JWT (jsonwebtoken)
Redis (ioredis)
bcrypt (optional for password hashing)
dotenv
cookie-parser
cors
📁 Project Structure
Backend/
│
├── Redis/
│   ├── redis.js          # Redis client (publisher/subscriber optional)
│   ├── rateLimiter.js    # Sliding window rate limiter (ZSET)
│
├── server.js             # Main Express server
├── .env
└── package.json
🔐 JWT Authentication Flow
1. Login
Request
POST /api/login
Flow
User Login
  ↓
Generate Access Token (15 min)
Generate Refresh Token (7 days)
  ↓
Store Refresh Token in Redis
  ↓
Send Access Token to Client (cookie)
Redis Key
refresh:user@email.com → refresh_token
2. Refresh Token Validation
Request
POST /api/auth
Flow
Client sends email
  ↓
Fetch token from Redis
  ↓
Verify JWT
  ↓
Return decoded user
3. Logout
Request
POST /api/logout
Flow
Delete refresh:user@email.com from Redis
📩 OTP System (Redis-based)
1. Generate OTP
Request
POST /auth/send-otp
Flow
Generate OTP
  ↓
Store in Redis (otp:user@email.com)
  ↓
Set expiry = 300 seconds (5 min)
Redis Key
otp:user@email.com → 123456 (expires in 5 min)
2. Verify OTP
Request
POST /auth/verify-otp
Flow
Fetch OTP from Redis
  ↓
Compare with user input
  ↓
If match → delete key
⚡ Rate Limiter (Sliding Window using ZSET)
Concept

We store timestamps of requests in Redis Sorted Set.

Algorithm
Request Flow
Incoming request
  ↓
Remove old timestamps (> time window)
  ↓
Count requests in window
  ↓
If limit exceeded → block
Else → allow + add timestamp
Redis Structure
rate:userIP → ZSET
score = timestamp
value = timestamp
Example
Limit: 5 requests / 10 seconds
ZADD rate:127.0.0.1 1710000000 1710000000
🧩 Redis Usage Summary
Feature	Redis Type
Refresh Token	String
OTP Storage	String (with TTL)
Rate Limiter	Sorted Set (ZSET)


Note:-i implemented pub/sub too but it dont work, so u have to find error and fix it.