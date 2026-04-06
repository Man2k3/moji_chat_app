export const authMe = async (req, res) => {
  try {
    const user = req.user; // Assuming the user is attached to the request object by authentication middleware
    return res.status(200).json({ user });
  } catch (error) {
    console.error("Error during authMe:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const test = async (req, res) => {
  return res.sendStatus(204);
};
