const mongoose = require("mongoose");
const Role = require("../models/role.model.js");
const User = require("../models/user.model.js");

// Your roles object with numeric codes
const roles = {
  User: 2001,
  Admin: 5150,
  Editor: 1984,
};

// Seed data for Role documents (lowercase names!)
const rolesData = [
  {
    name: "admin",
    permissions: [
      "view:comments",
      "create:comments",
      "update:comments",
      "delete:comments",
    ],
  },
  {
    name: "editor",
    permissions: ["view:comments", "create:comments", "delete:comments"],
  },
  {
    name: "user",
    permissions: ["view:comments", "create:comments"],
  },
];

// Invert roles object: code => lowercase role name
const roleCodeMap = Object.entries(roles).reduce((acc, [key, val]) => {
  acc[val] = key.toLowerCase();
  return acc;
}, {});

async function seedRolesIfNeeded() {
  const count = await Role.countDocuments();

  if (count === 0) {
    console.log("No roles found, seeding roles...");
    await Role.insertMany(rolesData);
    console.log("✅ Roles seeded!");
  } else {
    console.log("Roles already exist, skipping seeding.");
  }
}

async function bulkUpdateUserRoles() {
  // Fetch roles from DB and build name -> ObjectId map
  const rolesFromDb = await Role.find({
    name: { $in: Object.values(roleCodeMap) },
  });
  // console.log("rolesFromDb", rolesFromDb);

  const roleNameToId = rolesFromDb.reduce((acc, role) => {
    acc[role.name] = role._id;
    return acc;
  }, {});
  // console.log("roleNameToId", roleNameToId);
  // console.log("roleCodeMap", roleCodeMap);

  // Find users with numeric roleCode that matches your roles
  const roleCodes = Object.keys(roleCodeMap).map(Number);
  console.log("roleCodes", roleCodes);

  // const orConditions = Object.keys(roleCodeMap).map((roleKey) => ({
  //   [`roles.${roleKey}`]: { $in: roleCodes },
  // }));
  const orConditions = Object.entries(roles).map(([key, code]) => ({
    [`roles.${key}`]: code,
  }));
  console.log("orConditions", orConditions);

  const users = await User.find({ $or: orConditions });
  console.log("users", users);
  // return;

  console.log(`Found ${users.length} users to update`);

  // Prepare bulk update operations
  const bulkOps = users
    .map((user) => {
      if (!user.roles) return null;

      // user.roles is an object: { User: 2001, Admin: 5150, ... }
      const roleIds = Object.values(user.roles)
        .map((code) => {
          const roleName = roleCodeMap[code];
          return roleName ? roleNameToId[roleName] : null;
        })
        .filter(Boolean); // remove nulls

      if (roleIds.length === 0) {
        console.warn(`No matching roles found for user ${user._id}`);
        return null;
      }

      return {
        updateOne: {
          filter: { _id: user._id },
          update: { $set: { roles: roleIds } },
        },
      };
    })
    .filter(Boolean);

  if (bulkOps.length === 0) {
    console.log("No valid users to update");
    return;
  }

  const result = await User.bulkWrite(bulkOps);
  console.log("Bulk update complete:", result);
}

async function run() {
  try {
    await mongoose.connect(
      "mongodb+srv://mongotut:test123@cluster0.ag2vwko.mongodb.net/CompanyDB?retryWrites=true&w=majority&appName=Cluster0"
    );
    await seedRolesIfNeeded();
    await bulkUpdateUserRoles();
    await mongoose.disconnect();
    console.log("✅ All done!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

run();
