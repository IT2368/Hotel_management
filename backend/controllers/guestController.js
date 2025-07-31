import GuestProfile from '../models/profiles/GuestProfile.js';

// Get basic guest profile by userId
export const getGuestById = async (req, res) => {
  try {
    const userId = req.params.id;
    console.log("Looking for GuestProfile with userId:", userId);

    if (!userId || userId.length !== 24) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    const guestProfile = await GuestProfile.findOne({ userId });

    if (!guestProfile) {
      return res.status(404).json({ error: "Guest profile not found" });
    }

    res.json(guestProfile);
  } catch (error) {
    console.error("Error fetching guest profile:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
};
