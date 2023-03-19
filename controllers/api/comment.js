const { text } = require("express");
const express = require("express");
const router = express.Router();
const { Comment, Picture } = require("../../models");

router.post("/", async (req, res) => {
	try {
		if (!req.jwt.userId) {
			return res.sendStatus(403);
		}

		if (!(req.body.pictureId) || !(req.body.text)) {
			return res.sendStatus(400);
		}

		if (typeof req.body.text !== "string") {
			return res.sendStatus(422);
		}

		if (1 !== await Picture.count({
			where: {
				id: req.body.pictureId
			}
		})) {
			return res.sendStatus(422);
		}

		const comment = await Comment.create({
			pictureId: req.body.pictureId,
			text: req.body.text,
			userId: req.jwt.userId
		});
		return res.status(201).json({ id: comment.id, text: comment.text });
	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
}
);

router.put("/:commentId", async (req, res) => {
	try {
		if (!req.jwt.userId) {
			return res.sendStatus(403);
		}

		if (!(req.body.text)) {
			return res.sendStatus(400);
		}

		if ((typeof req.body.text !== "string")) {
			return res.sendStatus(422);
		}

		const [rows] = await Comment.update({
			text: req.body.text
		}, {
			where: {
				id: req.params.commentId,
				userId: req.jwt.userId
			}
		});
		if (rows === 0) {
			return res.sendStatus(404);
		}
		return res.status(200).json({ text: req.body.text });

	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
});

router.delete("/:commentId", async (req, res) => {
	try {
		if (!req.jwt.userId) {
			return res.sendStatus(403);
		}

		const rows = await Comment.destroy({
			where: {
				id: req.params.commentId,
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