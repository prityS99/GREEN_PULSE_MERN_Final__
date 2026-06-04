// const redis = require("redis");

// const redisClient = redis.createClient({
//   url: "redis://127.0.0.1:6379",
// });

// redisClient.on("error", (err) => {
//   console.log("Redis Error:", err.message);
// });

// redisClient.on("connect", () => {
//   console.log("Redis Connected Successfully");
// });

// (async () => {
//   try {
//     await redisClient.connect();
//   } catch (error) {
//     console.log("Redis Connection Failed");
//   }
// })();

// module.exports = redisClient;