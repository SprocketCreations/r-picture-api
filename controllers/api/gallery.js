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

		const userId = 1;
		const galleryId = req.params.galleryId;

		const gallery = await Gallery.findByPk(galleryId, {
			limit: pageLength,
			offset: pageNumber * pageLength,
			subQuery: false,
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
				}]),
				{
					through: {
						attributes: []
					},
					model: Picture,
					attributes: ["id", "name", "S3URL"],
					include: [
						{
							model: User,
							attributes: ["displayName"]
						}, {
							model: Comment,
							attributes: ["id"]
						}, {
							model: Like,
							attributes: ["id", "delta"]
						}
					]
				}
			],
		});

		const pictures = gallery.pictures.map(picture => ({
			id: picture.id,
			name: picture.name,
			ownerName: picture.user.displayName,
			commentCount: picture.comments.length,
			imageURL: picture.S3URL,
			score: picture.likes.reduce((score, { delta }) => score + delta, 0),
			like: picture.likes.find(like => like.id === userId),
		}));

		const responseJson = picturesOnly ? {
			pictures: pictures,
		} : {
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
		if (!(req.body.name) || !(req.body.description)) {
			return res.sendStatus(400);
		}
		if (typeof (req.body.name) !== 'string' || typeof (req.body.description) !== 'string') {
			return res.sendStatus(422);
		}

		const token = req.headers?.authorization?.split(" ")[1];
        if (!token) {
            res.sendStatus(403)
        }
        try {
            const data = jwt.verify(token, process.env.JWT_SECRET)
            const gallery = await Gallery.create({
				userId: data.id,
				name: req.body.name,
				description: req.body.description
			});
	
			return res.status(201).json({ id: gallery.id, name: gallery.name, description: gallery.description });
        } catch (err) {
            console.log(err);
            return res.status(403).json({ msg: "Invalid or missing token" })
        }
		
	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
});

router.put("/:galleryId", async (req, res) => {
	try {
		if ((!(req.body.name) && !(req.body.description)) ||
			(req.body.name && typeof (req.body.name) !== 'string') ||
			(req.body.description && typeof (req.body.description) !== 'string')) {
			return res.sendStatus(422);
		}
		const token = req.headers?.authorization?.split(" ")[1];
        if (!token) {
            res.sendStatus(403)
        }
        try {
            const data = jwt.verify(token, process.env.JWT_SECRET)
			const [rows] = await Gallery.update({
				name: req.body.name,
				description: req.body.description
			}, {
				where: {
					id: req.params.galleryId,
					userId: data.id
				}
			});
            if (rows === 0) {
				return res.sendStatus(404);
			}
			return res.status(200).json({
				name: req.body.name,
				description: req.body.description
			});
        } catch (err) {
            console.log(err);
            return res.status(403).json({ msg: "Invalid or missing token" })
        }
	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
});

router.delete("/:galleryId", async (req, res) => {
	try {
		const token = req.headers?.authorization?.split(" ")[1];
        if (!token) {
            res.sendStatus(403)
        }
        try {
            const data = jwt.verify(token, process.env.JWT_SECRET)
			const rows = await Gallery.destroy(
			 {
				where: {
					id: req.params.galleryId,
					userId: data.id
				}
			});
            if (rows === 0) {
				return res.sendStatus(404);
			}
			return res.status(200).json({ rows: rows });
        } catch (err) {
            console.log(err);
            return res.status(403).json({ msg: "Invalid or missing token" })
        }
	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
});

module.exports = router;