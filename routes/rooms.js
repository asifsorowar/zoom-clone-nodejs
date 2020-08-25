const express = require("express");
const router = express.Router();

router.get("/:room", (req, res) => {
  return res.status(200).render("room", { roomId: req.params.room });
});

module.exports = router;
