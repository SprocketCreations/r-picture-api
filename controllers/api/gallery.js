const express = require("express");
const router = express.Router();
const { Sequelize } = require("sequelize");
const { Gallery, User, Like, Picture, Comment } = require("../../models");

router.get("/:galleryId", async (req, res) => {
	try {
		// Get the query paramaters and cast the to the correct types.
		const picturesOnly = (req.query["pictures-only"] === 'true') || false;
		const pageLength = parseInt(req.query["page-length"]) || 10;
		const pageNumber = parseInt(req.query["page-number"]) || 0;

		const userId = req.jwt?.userId;
		const galleryId = req.params.galleryId;

		const gallery = await Gallery.findByPk(galleryId, {
			attributes: picturesOnly ? [] : [
				"id",
				"name",
				"description",
			],
			include: [
				...(picturesOnly ? [] : [{
					through: {
						attributes: []
					},
					model: User,
					as: "followedGallery",
					attributes: ["id"],
				}]), {
					through: {
						attributes: []
					},
					attributes: ["id", "createdAt"],
					model: Picture
				}
			],
		});

		const pictures = gallery.pictures.sort((a, b) => b.createdAt - a.createdAt).map(picture => picture.id);
		pictures.splice(pageLength * (pageNumber + 1));
		const responseJson = picturesOnly ? {
			pageLength: pageLength,
			pageNumber: pageNumber,
			pictures: pictures,
		} : {
			pageLength: pageLength,
			pageNumber: pageNumber,
			id: gallery.id,
			name: gallery.name,
			description: gallery.description,
			//js needs an `istruthy` operator.
			following: !!gallery.followedGallery.find(user => user.id === userId),
			followerCount: gallery.followedGallery.length,
			pictures: pictures,
		};
		return res.status(200).json(responseJson);
	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
});

router.post("/", async (req, res) => {
	try {
		if (!(req.jwt.userId)) {
			return res.sendStatus(403);
		}

		if (!(req.body.name)) {
			return res.sendStatus(400);
		}
		if (typeof (req.body.name) !== 'string' || typeof (req.body.description) !== 'string') {
			return res.sendStatus(422);
		}

		const gallery = await Gallery.create({
			userId: req.jwt.userId,
			name: req.body.name,
			description: req.body.description
		});

		return res.status(201).json({ id: gallery.id, name: gallery.name, description: gallery.description });
	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
});

router.put("/:galleryId", async (req, res) => {
	try {
		if (!(req.jwt.userId)) {
			return res.sendStatus(403);
		}

		if ((!(req.body.name) && !(req.body.description)) ||
			(req.body.name && typeof (req.body.name) !== 'string') ||
			(req.body.description && typeof (req.body.description) !== 'string')) {
			return res.sendStatus(422);
		}

		const [rows] = await Gallery.update({
			name: req.body.name,
			description: req.body.description
		}, {
			where: {
				id: req.params.galleryId,
				userId: req.jwt.userId
			}
		});

		if (rows === 0) {
			return res.sendStatus(404);
		}

		return res.status(200).json({
			name: req.body.name,
			description: req.body.description
		});
	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
});

router.delete("/:galleryId", async (req, res) => {
	try {
		if (!(req.jwt.userId)) {
			return res.sendStatus(403);
		}

		const rows = await Gallery.destroy(
			{
				where: {
					id: req.params.galleryId,
					userId: req.jwt.userId
				}
			});
		if (rows === 0) {
			return res.sendStatus(404);
		}
		return res.status(200).json({ rows: rows });
	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
});

module.exports = router;