const { text } = require("express");
const express = require("express");
const router = express.Router();
const { Comment, Picture } = require("../../models");


router.post("/", async (req, res) => {
    try {
        const userId = 1
        if (!(req.body.pictureId) || !(req.body.text)) {
            return res.sendStatus(400);
        }
        if (typeof req.body.text !== "string") {
            return res.sendStatus(422);
        }
        const rows = await Picture.count({
            where: {
                id: req.body.pictureId
            }
        })

        if (rows === 0) {
            return res.sendStatus(422);
        }
        const token = req.headers?.authorization?.split(" ")[1];
        if (!token) {
            res.sendStatus(403)
        }
        try {
            const data = jwt.verify(token, process.env.JWT_SECRET)
			const comment = await Comment.create({
                pictureId: req.body.pictureId,
                text: req.body.text,
                userId: data.id
            })
            console.log(comment.id)
            return res.status(201).json({ id: comment.id, text: comment.text });
        } catch (err) {
            console.log(err);
            return res.status(403).json({ msg: "Invalid or missing token" })
        }
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
}
);

router.put("/:commentId", async (req, res) => {
    try {
        if (!(req.body.text)) {
            return res.sendStatus(400);
        }

        if ((typeof req.body.text !== "string")) {
            return res.sendStatus(422);
        }
        const token = req.headers?.authorization?.split(" ")[1];
        if (!token) {
            res.sendStatus(403)
        }
        try {
            const data = jwt.verify(token, process.env.JWT_SECRET)
			const [rows] = await Comment.update(
                {
                    text: req.body.text
                },
                {
                    where: {
                        id: req.params.commentId,
                        userId: data.id
                    }
                })
            if (rows === 0) {
                return res.sendStatus(404)
            }
            return res.status(200).json({ text: req.body.text });
        } catch (err) {
            console.log(err);
            return res.status(403).json({ msg: "Invalid or missing token" })
        }
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
});

router.delete("/:commentId", async (req, res) => {
    try {
        const token = req.headers?.authorization?.split(" ")[1];
        if (!token) {
            res.sendStatus(403)
        }
        try {
            const data = jwt.verify(token, process.env.JWT_SECRET)
			const rows = await Comment.destroy({
                where: {
                    id: req.params.commentId,
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