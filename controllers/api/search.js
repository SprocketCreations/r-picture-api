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
		console.log(tagName)
		const tags = await Tag.findAll({
			where: {
				name: {
					[Op.like]: `%${tagName}%`
				}
			},
			include: [
				{
					attributes: ["id", "createdAt"],
					model: Picture,
				}
			]
		});

		if (!tags) return res.sendStatus(404);

		const pictures = tags
			.reduce((pictures, tag) => pictures.concat(tag.pictures.map(picture => ({
				id: picture.id,
				createdAt: picture.createdAt
			}))), []);

		pictures.sort((a, b) => b.createdAt - a.createdAt);
		pictures.splice(pageLength * (pageNumber + 1));

		return res.status(200).json({
			pageLength: pageLength,
			pageNumber: pageNumber,
			pictures: pictures.map(picture => picture.id)
		});
	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
});

router.get("/gallery/:gallery", async (req, res) => {
	try {
		const userId = req.jwt?.userId;

		const pageLength = parseInt(req.query["page-length"]) || 10;
		const pageNumber = parseInt(req.query["page-number"]) || 0;

		/** @type {string} The search term. */
		const searchTerm = decodeURIComponent(req.params.gallery).toLowerCase();

		const alikeGalleries = await Gallery.findAll({
			where: {
				name: Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("name")), "LIKE", `%${searchTerm}%`)
			},
			attributes: ["id"]
		});

		const galleries = await Promise.all(alikeGalleries.map(async gallery => {
			return await Gallery.findByPk(gallery.id, {
				attributes: ["id", "name"],
				include: [{
					through: {
						attributes: []
					},
					model: User,
					as: "followedGallery",
					attributes: ["id"],
				}]
			});
		}));

		galleries.sort((a, b) => b.followedGallery.length - a.followedGallery.length);
		galleries.splice(pageLength * (pageNumber + 1));

		return res.status(200).json({
			galleries: galleries.map(gallery => ({
				id: gallery.id,
				name: gallery.name,
				following: !!gallery.followedGallery?.find(user => user.id === userId),
				followerCount: gallery.followedGallery?.length,
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
			attributes: ["id", "createdAt"],
			where: {
				name: Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("name")), "LIKE", `%${searchTerm}%`)
			},
		});

		const pictureIds = pictures.map(picture => ({
			id: picture.id,
			createdAt: picture.createdAt
		})).sort((a, b) => b.createdAt - a.createdAt).map(picture => picture.id);

		pictureIds.splice(pageLength * (pageNumber + 1));

		return res.status(200).json({
			pageLength: pageLength,
			pageNumber: pageNumber,
			pictures: pictureIds
		});
	} catch (error) {
		console.log(error);
		return res.sendStatus(500);
	}
});


module.exports = router;