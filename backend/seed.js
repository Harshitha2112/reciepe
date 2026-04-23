const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected for Seeding");

    const adminExists = await User.findOne({ email: "admin@recipehub.com" });
    if (!adminExists) {
      await User.create({
        name: "Admin User",
        email: "admin@recipehub.com",
        password: "adminpassword123",
        role: "ADMIN",
      });
      console.log("✅ Admin seeded");
    } else {
      console.log("ℹ️  Admin already exists");
    }

    const subAdminExists = await User.findOne({ email: "subadmin@recipehub.com" });
    if (!subAdminExists) {
      await User.create({
        name: "Sub Admin User",
        email: "subadmin@recipehub.com",
        password: "subadminpassword123",
        role: "SUBADMIN",
      });
      console.log("✅ Sub-Admin seeded");
    } else {
      console.log("ℹ️  Sub-Admin already exists");
    }

    const userExists = await User.findOne({ email: "user@recipehub.com" });
    if (!userExists) {
      await User.create({
        name: "Standard User",
        email: "user@recipehub.com",
        password: "userpassword123",
        role: "USER",
      });
      console.log("✅ User seeded");
    } else {
      console.log("ℹ️  User already exists");
    }

    console.log("\n🎉 Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
