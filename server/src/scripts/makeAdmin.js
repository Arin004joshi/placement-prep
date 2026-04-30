const connectDb = require("../config/db");
const User = require("../models/User");

const makeAdmin = async () => {
  const email = process.argv[2];

  if (!email) {
    throw new Error("Usage: npm run make-admin -- user@example.com");
  }

  await connectDb();

  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { $set: { role: "admin" } },
    { new: true }
  );

  if (!user) {
    throw new Error(`No user found for email: ${email}`);
  }

  console.log(`${user.email} is now an admin`);
  process.exit(0);
};

makeAdmin().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
