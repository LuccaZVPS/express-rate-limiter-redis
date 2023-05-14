# express-rate-limiter-redis

`express-rate-limiter-redis` is a middleware library for rate limiting in Express applications using Redis as the storage backend. It allows you to control the rate of incoming requests from clients and protect your server from excessive traffic.

## Installation

Install the package via npm:

```shell
npm install express-rate-limiter-redis
```

## Usage

To use `express-rate-limiter-redis` in your Express application, follow these steps:

1. Import the necessary modules:

   ```javascript
   import express from "express";
   import rateLimiter from "express-rate-limiter-redis";
   import ioredis from "ioredis";
   ```

2. Create an instance of the Redis client:
   2.1 Using ioredis
   ```javascript
   const client = ioredis.createClient();
   ```
   2.2 Using node-redis
   ```javascript
   const client = ioredis.createClient();
   await client.connect();
   ```
3. Configure and create the rate limiter middleware:
   3.1 Creating an rate limiter usign ioredis

   ```javascript
   const limiter = rateLimiter({
     expiresIn: 60000, // Rate limiter will expire after 60,000 milliseconds (1 minute)
     key: (req) => req.ip, // Use the IP address of the request as the key to identify the client
     max: 300, // Maximum number of requests allowed per client within the defined duration
     // @ts-expect-error - Avoid ts errors when using ioredis libary
     store: (...args) => client.call(...args), // A callback function to execute Redis commands for storing and retrieving information about the client in the rate limiter
     message: "You have exceeded the maximum number of requests.", // Optional message to send when rate limit is exceeded
   });
   ```

   3.2 Creating an rate limiter usign ioredis

   ```javascript
   const limiter = rateLimiter({
     expiresIn: 60000, // Rate limiter will expire after 60,000 milliseconds (1 minute)
     key: (req) => req.ip, // Use the IP address of the request as the key to identify the client
     max: 300, // Maximum number of requests allowed per client within the defined duration
     store: (...args) => client.sendCommand(args), // A callback function to execute Redis commands for storing and retrieving information about the client in the rate limiter
     message: "You have exceeded the maximum number of requests.", // Optional message to send when rate limit is exceeded
   });
   ```

4. Apply the rate limiter middleware to your Express application:

   ```javascript
   const app = express();

   app.use(limiter);

   // Define your routes and application logic here...

   app.listen(3000, () => {
     console.log("Server is running on port 3000");
   });
   ```

## Rate Limiter Options

The following options are available when configuring the rate limiter:

- `expiresIn` (number): The expiration time of the rate limiter in milliseconds.
- `key` ((req: Request) => string): A function that returns the key to identify the client in the rate limiter storage.
- `max` (number): The maximum number of requests allowed per client within the defined duration.
- `store` ((...args: string[]) => any): A callback function to execute Redis commands for storing and retrieving information about the client in the rate limiter.
- `message` (string, optional): An optional message to send along with the error response when the rate limit is exceeded.

## Example: Applying Rate Limiter to a Specific Route

You can also apply the rate limiter middleware to specific routes. Here's an example of applying the rate limiter to a login route:

```javascript
const loginLimiter = rateLimiter({
  expiresIn: 60 * 60, // Rate limiter will expire after 60 minutes
  key: (req) => req.ip, // Use the IP address of the request as the key to identify the client
  max: 15, // Maximum number of requests allowed per client within the defined duration
  store: (...args) => client.call(...args), // A callback function to execute Redis commands for storing and retrieving information about the client in the rate limiter
  message: "You have reached the maximum number of login attempts.", // Optional message to send when rate limit is exceeded
});

app.post("/login", loginLimiter, (req, res
```

## Resetting the Rate Limiter

You can reset the rate limiter for a specific client by accessing the `resetKey` function within the request object. Here's an example of resetting the rate limiter for a `/reset` route:

```javascript
app.post("/reset", limiter, async (req, res) => {
  await req.resetKey(req.ip);
  res.send("Counter reset!");
});
```

## Response Headers

When using `express-rate-limiter-redis`, several custom headers can be added to the response to provide information about the rate limit. These headers can be used by the client to understand the rate limiting status and adjust their requests accordingly.

- `X-Rate-Limit-Limit`: Represents the maximum number of requests allowed per client within the defined duration (`max` value from the rate limiter options).
- `X-Rate-Limit-Remaining`: Indicates the remaining number of requests that the client can make within the defined duration. If the value is negative, it means the client has exceeded the rate limit and no more requests are allowed.
- `X-Rate-Limit-Duration`: Specifies the total duration of the rate limit in seconds. It represents the length of time for which the rate limit is set.
