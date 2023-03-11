const express = require('express');
const router = express.Router();
const { User } = require("../../models")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")


const searchRoutes = require("./search");
router.use("/search", searchRoutes);

const userRoutes = require("./user")
router.use("/user", userRoutes)

const galleryRoutes = require("./gallery")
router.use("/gallery", galleryRoutes)

const pictureRoutes = require("./picture")
router.use("/picture", pictureRoutes)

const commentRoutes = require("./comment")
router.use("/comment", commentRoutes)

const likeRoutes = require("./like");
const { signUser } = require('../../utils/jwt');
router.use("/like", likeRoutes)

router.post("/signin", async (req, res) => {
	try {
		if (!req.body.email || !req.body.password) {
			return res.sendStatus(400)
		}

		const user = await User.findOne({
			where: {
				email: req.body.email
			}
		});

		if (!user) {
			return res.sendStatus(403)
		}

		if (!bcrypt.compareSync(req.body.password, user.password)) {
			return res.sendStatus(403)
		}

		return res.status(201).json({ token: signUser(user.id) });
	} catch (err) {
		console.log(err);
		return res.sendStatus(500);
	}
})

module.exports = router;