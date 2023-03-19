const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { User, Picture, Gallery, Comment, Like, GalleryUser, UserUser } = require("../../models");
const jwt = require("jsonwebtoken");
const { signUser } = require("../../utils/jwt");

//Get 1 user
router.get("/:userId", async (req, res) => {
	try {
		if (req.jwt.userId !== parseInt(req.params.userId)) {
			return res.sendStatus(403);
		}

		const user = await User.findByPk(req.params.userId)
		if (!user) {
			return res.sendStatus(404);
		}

		return res.status(201).json({
			displayName: user.displayName
		});
	} catch (err) {
		console.log(err);
		res.sendStatus(500);
	}
})

//Create a user
router.post("/", async (req, res) => {
	try {
		if (!(req.body.displayName) || !(req.body.email) || !(req.body.password)) {
			return res.sendStatus(400)
		}

		{// Check email isn't taken
			const user = await User.findOne({
				where: {
					email: req.body.email
				}
			});
			if (user) return res.sendStatus(422)

		} {// Create new user
			const user = await User.create({
				displayName: req.body.displayName,
				email: req.body.email,
				password: req.body.password,
				bio: req.body.bio,
			});
			return res.status(201).json({
				jwt: signUser(user.id)
			});
		}
	} catch (err) {
		console.log(err);
		res.sendStatus(500);
	}
})

//Update a user
router.put("/:userId", async (req, res) => {
	try {
		if (req.jwt.userId !== parseInt(req.params.userId)) {
			return res.sendStatus(403);
		}

		if (req.body.newPassword && !req.body.oldPassword) {
			return res.sendStatus(400)
		}
		if (!req.body.newPassword && req.body.oldPassword) {
			return res.sendStatus(400)
		}

		const user = await User.findByPk(req.params.userId);
		if (!user) {
			return res.sendStatus(404);
		}

		if (req.body.oldPassword) {
			if (!await bcrypt.compare(req.body.oldPassword, user.password)) {
				return res.sendStatus(403);
			}
		}

		const updatedUser = await User.update({
			email: req.body.email,
			password: req.body.newPassword,
			displayName: req.body.displayName
		}, {
			where: {
				id: req.params.userId
			}
		});

		return res.sendStatus(204);
	} catch (err) {
		console.log(err);
		res.sendStatus(500);
	}
})

//Delet a user
router.delete("/:userId", async (req, res) => {
	try {
		if (req.jwt.userId !== parseInt(req.params.userId)) {
			return res.sendStatus(403);
		}

		if (!req.body.password) {
			return res.sendStatus(400);
		}

		const user = await User.findByPk(req.params.userId);
		if (!user) {
			return res.sendStatus(404);
		}

		if (!await bcrypt.compare(req.body.password, user.password)) {
			return res.sendStatus(403);
		}

		const rows = await User.destroy({
			where: {
				id: req.params.userId
			}
		});

		if (rows === 0) {
			return res.sendStatus(404);
		}

		return res.status(201).json({ rows: rows });
	} catch (err) {
		console.log(err);
		return res.sendStatus(500);
	}
})

router.get("/0/feed", async (req, res) => {
	try {
		const pageLength = parseInt(req.query["page-length"]) || 10;
		const pageNumber = parseInt(req.query["page-number"]) || 0;


		const pictures = await Picture.findAll({
			limit: pageLength,
			offset: pageLength * pageNumber,
			order: [
				["createdAt", "DESC"]
			],
			attributes: ["id"]
		});

		return res.status(200).json({
			pageLength: pageLength,
			pageNumber: pageNumber,
			pictures: pictures.map(picture => ({ id: picture.id }))
		});
	} catch (err) {
		console.log(err);
		return res.sendStatus(500);
	}
});
//18
router.get("/:userId/feed", async (req, res) => {
	try {
		if (req.jwt.userId !== parseInt(req.params.userId)) {
			return res.sendStatus(403);
		}

		const pageLength = parseInt(req.query["page-length"]) || 10;
		const pageNumber = parseInt(req.query["page-number"]) || 0;

		/** @type {number[]} */
		const followingGalleryIds = (await GalleryUser.findAll({
			attributes: ["followedGalleryId"],
			where: {
				followerUserId: req.jwt.userId
			}
		}))?.map(galleryUser => galleryUser.followedGalleryId);

		/** @type {number[]} */
		const followingUserIds = (await UserUser.findAll({
			attributes: ["followedUserId"],
			where: {
				followerUserId: req.jwt.userId
			},
		}))?.map(userUser => userUser.followedUserId);

		const galleryPicturePromises = followingGalleryIds.map(async galleryId => {
			const gallery = await Gallery.findByPk(galleryId, {
				include: [{
					model: Picture,
					attributes: ["id", "createdAt"]
				}]
			});
			return gallery?.pictures?.map(picture => ({ id: picture.id, createdAt: picture.createdAt, galleryId: galleryId })) || [];
		});

		const userPicturePromises = followingUserIds.map(async userId => {
			const user = await User.findByPk(userId, {
				include: [{
					model: Picture,
					attributes: ["id", "createdAt"]
				}]
			});
			return user?.pictures?.map(picture => ({ id: picture.id, createdAt: picture.createdAt })) || [];
		});

		/** @type {[[], []]} */
		let [galleryPictures, userPictures] = await Promise.all([Promise.all(galleryPicturePromises), Promise.all(userPicturePromises)]);

		galleryPictures = galleryPictures.reduce((allPictures, pictures) => allPictures.concat(pictures), []);
		userPictures = userPictures.reduce((allPictures, pictures) => allPictures.concat(pictures), []);

		/** @type {Array<{id:number, createdAt:number}>} */
		const pictures = galleryPictures.concat(userPictures);

		pictures.sort((a, b) => b.createdAt - a.createdAt);

		pictures.splice(pageLength * (pageNumber + 1));

		return res.status(200).json({
			pageLength: pageLength,
			pageNumber: pageNumber,
			pictures: pictures.map(picture => ({
				id: picture.id,
				galleryId: picture.galleryId
			}))
		});
	} catch (err) {
		console.log(err);
		res.sendStatus(500);
	}
})

//20
router.get("/:userId/profile", async (req, res) => {
	try {
		const userId = req.jwt?.userId;
		const picturesOnly = (req.query["pictures-only"] === 'true') || false;
		const pageLength = parseInt(req.query["page-length"]) || 10;
		const pageNumber = parseInt(req.query["page-number"]) || 0;

		const user = await User.findByPk(req.params.userId, {
			attributes: picturesOnly ? [] : ["bio", "id", "displayName"],
			include: [
				...(picturesOnly ? [] : [{
					through: {
						attributes: []
					},
					model: User,
					as: "followedUser",
					attributes: ["id"]
				}]), {
					model: Picture,
					attributes: ["id", "createdAt"]
				}
			]
		});

		const pictures = user.pictures.sort((a, b) => b.createdAt - a.createdAt).map(picture => picture.id);
		pictures.splice(pageLength * (pageNumber + 1));

		if (!user) {
			return res.sendStatus(404);
		}

		return res.json(picturesOnly ? { pictures: pictures } : {
			id: user.id,
			displayName: user.displayName,
			bio: user.bio,
			following: !!user.followedUser.find(user => user.id === userId),
			followerCount: user.followedUser.length,
			followers: user.followedUser,
			pictures: pictures
		});
	} catch (err) {
		console.log(err);
		res.sendStatus(500);
	}
})

router.get("/:userId/gallery", async (req, res) => {
	try {
		if (req.jwt.userId !== parseInt(req.params.userId)) {
			return res.sendStatus(403);
		}

		const followingGalleryIds = (await GalleryUser.findAll({
			attributes: [],
			where: {
				followerUserId: req.jwt.userId
			},
			include: [{
				model: Gallery,
				as: "followedGallery",
				attributes: ["id", "name"],
			}]
		}))?.map(galleryUser => ({
			id: galleryUser.followedGallery.id,
			name: galleryUser.followedGallery.name
		}));

		return res.status(200).json({
			galleries: followingGalleryIds
		});
	} catch (err) {
		console.log(err);
		res.sendStatus(500);
	}
});

router.post("/:userId/follow-gallery/:galleryId", async (req, res) => {
	try {
		if (req.jwt.userId !== parseInt(req.params.userId)) {
			return res.sendStatus(403);
		}

		await GalleryUser.create({
			followerUserId: req.params.userId,
			followedGalleryId: req.params.galleryId
		});

		return res.sendStatus(201);
	} catch (err) {
		console.log(err);
		res.sendStatus(500);
	}
});

router.delete("/:userId/follow-gallery/:galleryId", async (req, res) => {
	try {
		if (req.jwt.userId !== parseInt(req.params.userId)) {
			return res.sendStatus(403);
		}

		await GalleryUser.destroy({
			where: {
				followerUserId: req.params.userId,
				followedGalleryId: req.params.galleryId
			}
		});

		return res.sendStatus(200);
	} catch (err) {
		console.log(err);
		res.sendStatus(500);
	}
});

router.post("/:userId/follow-user/:userId2", async (req, res) => {
	try {
		if (req.jwt.userId !== parseInt(req.params.userId)) {
			return res.sendStatus(403);
		}

		await UserUser.create({
			followerUserId: req.params.userId,
			followedUserId: req.params.userId2
		});

		return res.sendStatus(201);
	} catch (err) {
		console.log(err);
		res.sendStatus(500);
	}
});

router.delete("/:userId/follow-user/:userId2", async (req, res) => {
	try {
		if (req.jwt.userId !== parseInt(req.params.userId)) {
			return res.sendStatus(403);
		}

		console.log(await UserUser.destroy({
			where: {
				followerUserId: req.params.userId,
				followedUserId: req.params.userId2
			}
		}));

		return res.sendStatus(200);
	} catch (err) {
		console.log(err);
		res.sendStatus(500);
	}
});

module.exports = router;
