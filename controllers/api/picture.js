const express = require('express');
const { v4: uuidv4 } = require("uuid");
const router = express.Router();
const aws = require("aws-sdk");

const { Picture, Gallery, GalleryPicture, PictureTag, Tag, User, Comment, Like } = require('../../models');

router.post("/:pictureId/gallery", async (req, res) => {
	try {
		const userId = 1;
		if (!(req.body.galleryId)) {
			return res.sendStatus(400);
		}

		const [pictureCount, galleryCount] = await Promise.all([
			Picture.count({ where: { id: req.params.pictureId } }),
			Gallery.count({ where: { id: req.body.galleryId } })
		]);

		if (pictureCount === 0 || galleryCount === 0) {
			return res.sendStatus(404);
		}
		const token = req.headers?.authorization?.split(" ")[1];
		if (!token) {
			res.sendStatus(403)
		}
		try {
			const data = jwt.verify(token, process.env.JWT_SECRET)
			await GalleryPicture.create({
				userId: data.id,
				galleryId: req.body.galleryId,
				pictureId: req.params.pictureId
			});

			return res.sendStatus(204);
		} catch (err) {
			console.log(err);
			return res.status(403).json({ msg: "Invalid or missing token" })
		}
	} catch (error) {
		if (error.name === "SequelizeUniqueConstraintError") {
			return res.sendStatus(409);
		}
		console.log(error);
		return res.sendStatus(500);
	}
});

router.delete("/:pictureId/gallery/:galleryId", async (req, res) => {
	try {
		const userId = 1;
		const token = req.headers?.authorization?.split(" ")[1];
		if (!token) {
			res.sendStatus(403)
		}
		try {
			const data = jwt.verify(token, process.env.JWT_SECRET)
			const rows = await GalleryPicture.destroy({
				where: {
					userId: data.id,
					galleryId: req.params.galleryId,
					pictureId: req.params.pictureId
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

router.get("/:pictureId", async (req, res) => {
	try {
		const picture = await Picture.findByPk(req.params.pictureId, {
			model: Picture,
			attributes: ["id", "name", "description", "S3URL"],
			include: [
				{
					through: {
						attributes: []
					},
					model: Gallery,
					attributes: ["id", "name"],
					include: [{
						through: {
							attributes: []
						},
						model: User,
						as: "followedGallery",
						attributes: ["id"],
					}]
				}, {
					model: User,
					attributes: ["id", "displayName"]
				}, {
					model: Comment,
					attributes: ["id", "text", "createdAt"],
					include: [{
						model: User,
						attributes: ["id", "displayName"]
					}]
				}, {
					model: Like,
					attributes: ["id", "delta", "userId"]
				}
			]
		});

		return res.json({
			id: picture.id,
			name: picture.name,
			description: picture.description,
			imageURL: picture.S3URL,
			score: picture.likes.reduce((score, { delta }) => score + delta, 0),
			like: picture.likes.find(like => like.userId === req.jwt?.userId),
			owner: {
				id: picture.user.id,
				displayName: picture.user.displayName
			},
			galleries: picture.galleries.map(gallery => ({
				id: gallery.id,
				name: gallery.name,
				followerCount: gallery.followedGallery.length,
				following: !!gallery.followedGallery.find(user => user.id === req.jwt?.userId)
			})),
			comments: picture.comments.sort((a, b) => b.createdAt - a.createdAt).map(comment => ({
				id: comment.id,
				text: comment.text,
				...(comment.user ? {
					owner: {
						id: comment.user.id,
						displayName: comment.user.displayName
					}
				} : {})
			}))
		});
	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
})


router.post("/", async (req, res) => {
	try {
		/**
		 * @param {string} url The url to sign.
		 */
		const signUrl = async url => { };

		/**
		 * @param {string} url The url to hit.
		 */
		const hitUrl = async url => {
			try {
				return await new aws.S3().headObject({ Bucket: process.env.S3_BUCKET, Key: url }).promise();
			} catch (error) {
				console.log(error);
				return null;
			}
		};

		if (!(req.jwt.userId)) {
			return res.sendStatus(403);
		}

		if (!(req.body.name)) {
			return res.sendStatus(400);
		}

		if (!process.env.S3_BUCKET) throw new Error("S3_BUCKET environment variable is not configured.");

		const fileName = `${uuidv4()}.jpg`;
		const url = `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${fileName}`;

		const signedRequest = await new Promise(
			(resolve, reject) => new aws.S3().getSignedUrl(
				"putObject",
				{
					Bucket: process.env.S3_BUCKET,
					Key: fileName,
					Expires: 60,
					ContentType: "jpg",
					ACL: "public-read"
				},
				(error, data) => error ? reject(error) : resolve(data)
			));

		const picture = await Picture.create({
			userId: req.jwt.userId,
			name: req.body.name,
			description: req.body.description,
			S3URL: url
		});

		if (req.body.tags) {
			const allTagIds = [];
			for (let i = 0; i < req.body.tags.length; ++i) {
				const tagName = req.body.tags[i].toLowerCase();
				const [nextTag] = await Tag.findOrCreate({
					where: {
						name: tagName
					},
					attributes: ["id"]
				});
				allTagIds.push(nextTag.id);
			}
			await PictureTag.bulkCreate(allTagIds.map(currentTagId => {
				return {
					tagId: currentTagId,
					pictureId: picture.id
				}
			}));
		}

		return res.status(201).json({
			id: picture.id,
			name: picture.name,
			description: picture.description,
			url: url,
			signedRequest: signedRequest
		});
	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
});

router.put("/:pictureId", async (req, res) => {
	try {
		if (!(req.jwt.userId)) {
			return res.sendStatus(403);
		}

		//TODO: Allow the user to add tags as well
		const [rows] = await Picture.update({
			name: req.body.name,
			description: req.body.description
		}, {
			where: {
				id: req.params.pictureId,
				userId: req.jwt.userId
			}
		});

		if (rows !== 1) {
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
})

router.delete("/:pictureId", async (req, res) => {
	try {
		if (!(req.jwt.userId)) {
			return res.sendStatus(403);
		}

		const rows = await Picture.destroy({
			where: {
				id: req.params.pictureId,
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
