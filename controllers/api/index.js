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

const likeRoutes = require("./like")
router.use("/like", likeRoutes)

router.post("/signin", async (req, res) => {
    try {
        if (!req.body.email) {
            res.sendStatus(400)
        } else if (!req.body.password) {
            res.sendStatus(400)
        }
        const user = await User.findOne({
            where: {
                email: req.body.email
            }
        })
        if (!user) {
            res.sendStatus(403)
        } else if (!bcrypt.compareSync(req.body.password, user.password)) {
            res.sendStatus(403)
        } else {
            const token = jwt.sign({
                id: user.id,
                displayName: user.displayName
            }, process.env.JWT_SECRET, {
                expiresIn: "6h"
            })
            console.log(token)
            res.status(201).json(
                {
                token: token,
                user: user
                }
            )
        }
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
})

module.exports = router;