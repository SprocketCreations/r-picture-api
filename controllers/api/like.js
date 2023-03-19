const express = require("express");
const router = express.Router();
const { Like } = require("../../models");

router.post("/", async (req, res) => {
	try {
		if (!(req.jwt.userId)) {
			return res.sendStatus(403);
		}

		if (!(req.body.pictureId) || !(req.body.delta)) {
			return res.sendStatus(400);
		}
		
		if (typeof (req.body.pictureId) !== 'number' || typeof (req.body.delta) !== 'number') {
			return res.sendStatus(422);
		}

		{ // Check that a user has not already liked/disliked this picture.
			const liked = await Like.findOne({
				where: {
					pictureId: req.body.pictureId,
					userId: req.jwt.userId
				}
			});

			if (liked) {
				return res.sendStatus(422);
			}
			// Create the like. TODO: This is not atomic and will need to be made into a transaction.
			const like = await Like.create({
				delta: req.body.delta,
				pictureId: req.body.pictureId,
				userId: req.jwt.userId
			});
			return res.status(201).json({ id: like.id });
		}
	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
});

router.put("/:likeId", async (req, res) => {
	try {
		if (!(req.jwt.userId)) {
			return res.sendStatus(403);
		}

		if (!(req.body.delta)) {
			return res.sendStatus(400);
		}

		if (typeof (req.body.delta) !== 'number') {
			return res.sendStatus(422);
		}

		const [rows] = await Like.update({
			delta: req.body.delta
		}, {
			where: {
				id: req.params.likeId,
				userId: req.jwt.userId
			}
		});

		if (rows !== 1) {
			return res.sendStatus(404);
		}

		return res.sendStatus(204);
	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
});

router.delete("/:likeId", async (req, res) => {
	try {
		if (!(req.jwt.userId)) {
			return res.sendStatus(403);
		}

		const rows = await Like.destroy({
			where: {
				id: req.params.likeId,
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