import { subscriber } from "./redis.js";


// listen OTP events
subscriber.subscribe("otp:sent", (message) => {
  const data = JSON.parse(message);
  console.log("📩 OTP Event received:", data);

  // simulate email service
  console.log(`Sending email to ${data.email} with OTP ${data.otp}`);
});

// login event
subscriber.subscribe("user:login", (message) => {
  const data = JSON.parse(message);
  console.log("🔐 Login Event:", data.email);
});

// logout event
subscriber.subscribe("user:logout", (message) => {
  const data = JSON.parse(message);
  console.log("🚪 Logout Event:", data.email);
});