const express = require("express");
const router = express.Router();
const { Like } = require("../../models");

router.post("/", async (req, res) => {
	try {
		if (!(req.body.pictureId) || !(req.body.delta)) {
			return res.sendStatus(400);
		}

		if (typeof (req.body.pictureId) !== 'number' || typeof (req.body.delta) !== 'number') {
			return res.sendStatus(422);
		}
		
		{
			const token = req.headers?.authorization?.split(" ")[1];
			if (!token) {
				res.sendStatus(403)
			}
			try {
				const data = jwt.verify(token, process.env.JWT_SECRET)
				// Check that a user has not already liked/disliked this picture.
				const liked = await Like.findOne({
					where: {
						pictureId: req.body.pictureId,
						userId: data.id
					}
				});
	
				if (liked) {
					return res.sendStatus(422);
				}
				// Create the like. TODO: This is not atomic and will need to be made into a transaction.
				const like = await Like.create({
					delta: req.body.delta,
					pictureId: req.body.pictureId,
					userId: data.id
				});
				return res.sendStatus(204);
			} catch (err) {
				console.log(err);
				return res.status(403).json({ msg: "Invalid or missing token" })
			}
		}
	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
});

router.put("/:likeId", async (req, res) => {
	try {
		if (!(req.body.delta)) {
			return res.sendStatus(400);
		}

		if (typeof (req.body.delta) !== 'number') {
			return res.sendStatus(422);
		}
		const token = req.headers?.authorization?.split(" ")[1];
        if (!token) {
            res.sendStatus(403)
        }
        try {
            const data = jwt.verify(token, process.env.JWT_SECRET)
			const [rows] = await Like.update({
				delta: req.body.delta
			}, {
				where: {
					id: req.params.likeId,
					userId: data.id
				}
			});
			console.log(rows);
			if (rows) {
				return res.sendStatus(204);
			}
	
			return res.sendStatus(404);
        } catch (err) {
            console.log(err);
            return res.status(403).json({ msg: "Invalid or missing token" })
        }
	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
});

router.delete("/:likeId", async (req, res) => {
	try {
		const token = req.headers?.authorization?.split(" ")[1];
        if (!token) {
            res.sendStatus(403)
        }
        try {
            const data = jwt.verify(token, process.env.JWT_SECRET)
			const rows = await Like.destroy({
				where: {
					id: req.params.likeId,
					userId:data.id
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