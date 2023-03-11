const express = require('express');
const router = express.Router();

const { Picture, Tag, Comment, Like, User, Gallery } = require("../../models");
const { Op, Sequelize } = require('sequelize');


router.get("/tag/:tag", async (req, res) => {
	try {
		const userId = 1 || 0;

		const pageLength = parseInt(req.query["page-length"]) || 10;
		const pageNumber = parseInt(req.query["page-number"]) || 0;

		const tagName = decodeURIComponent(req.params.tag).toLowerCase();

		const tags = await Tag.findAll({
			limit: pageLength,
			offset: pageNumber * pageLength,
			subQuery: false,
			where: {
				name: {
					[Op.like]: `%${tagName}%`
				}
			},
			include: [
				{
					model: Picture,
					include: [
						{
							model: Comment,
							attributes: ["id"]
						}, {
							model: Like,
							attributes: ["id", "userId", "delta"]
						}, {
							model: User,
							attributes: ["id", "displayName"]
						}
					]
				}
			]
		});

		return res.status(200).json({
			pageLength: pageLength,
			pageNumber: pageNumber,
			pictures: tags.reduce((prev, tag) => prev.concat(tag.pictures), []).map(picture => ({
				id: picture.id,
				name: picture.name,
				commentCount: picture.comments.length,
				score: picture.likes.reduce((prev, like) => prev + like.delta, 0),
				like: picture.likes.find(like => like.userId === userId),
				imageURL: picture.S3URL,
				owner: {
					id: picture.user.id,
					displayName: picture.user.displayName
				}
			}))
		});

	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
});

router.get("/gallery/:gallery", async (req, res) => {
	try {
		const userId = 1 || 0;

		const pageLength = parseInt(req.query["page-length"]) || 10;
		const pageNumber = parseInt(req.query["page-number"]) || 0;

		/** @type {string} The search term. */
		const searchTerm = decodeURIComponent(req.params.gallery).toLowerCase();

		const galleries = await Gallery.findAll({
			limit: pageLength,
			offset: pageNumber * pageLength,
			where: {
				name: Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("name")), "LIKE", `%${searchTerm}%`)
			},
			attributes: ["id", "name"]
		});

		return res.status(200).json({
			galleries: galleries.map(gallery => ({
				id: gallery.id,
				name: gallery.name
			}))
		});
	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
});

router.get("/picture/:picture", async (req, res) => {
	try {
		const userId = 1 || 0;

		const pageLength = parseInt(req.query["page-length"]) || 10;
		const pageNumber = parseInt(req.query["page-number"]) || 0;

		/** @type {string} The search term. */
		const searchTerm = decodeURIComponent(req.params.picture).toLowerCase();

		const pictures = await Picture.findAll({
			limit: pageLength,
			offset: pageNumber * pageLength,
			where: {
				name: Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("name")), "LIKE", `%${searchTerm}%`)
			},
			include: [
				{
					model: Comment,
					attributes: ["id"]
				}, {
					model: Like,
					attributes: ["id", "userId", "delta"]
				}, {
					model: User,
					attributes: ["id", "displayName"]
				}
			]
		});

		return res.status(200).json({
			pageLength: pageLength,
			pageNumber: pageNumber,
			pictures: pictures.map(picture => ({
				id: picture.id,
				name: picture.name,
				commentCount: picture.comments.length,
				score: picture.likes.reduce((prev, like) => prev + like.delta, 0),
				like: picture.likes.find(like => like.userId === userId),
				imageURL: picture.S3URL,
				owner: {
					id: picture.user.id,
					displayName: picture.user.displayName
				}
			}))
		});
	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
});


module.exports = router;