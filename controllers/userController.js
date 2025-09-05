const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // Exclude password field
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

exports.getSearchUser = async (req, res) => {
  try {
    const { search } = req.query;

    let filter = {};
    if (search && search.trim().length > 0) {
      filter = {
        $or: [
          { name: { $regex: `^${search}`, $options: "i" } },      // starts with search
          { username: { $regex: `^${search}`, $options: "i" } },  // starts with search
        ],
      };
    }

    const users = await User.find(filter, "-password"); // exclude password
    res.status(200).json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ message: "Failed to search users" });
  }
};


