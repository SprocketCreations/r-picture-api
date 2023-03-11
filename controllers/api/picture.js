const express = require('express');
const router = express.Router();

const { Picture, Gallery, GalleryPicture, PictureTag, Tag } = require('../../models');

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
		throw "Not implemented";
	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
})

router.post("/", async (req, res) => {
	try {
		const userId = 1
		if (!(req.body.name) || !(req.body.description)) {
			return res.sendStatus(400);
		}

		const picture = await Picture.create({
			userId: userId,
			name: req.body.name,
			description: req.body.description,
			S3URL: "placeholderurl.com"
		})
		const allTags = []
		for (let index = 0; index < req.body.tags.length; index++) {
			const tag = req.body.tags[index];
			const newTag = await Tag.create({
				name: tag
			})
			allTags.push(newTag)
		}
		await PictureTag.bulkCreate(allTags.map(currentTag => {
			return {
				tagId: currentTag.id,
				pictureId: picture.id
			}
		}))
		return res.status(201).json({
			id: picture.id, name: picture.name, description: picture.description
		});
	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
});

router.put("/:pictureId", async (req, res) => {
	try {
		throw "Not implemented";
		

		return res.status(200).json({});
	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
})

router.delete("/:pictureId", async (req, res) => {
	try {
		const rows = await Picture.destroy({
			where: {
				id: req.params.pictureId
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
