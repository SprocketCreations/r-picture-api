const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection.js");

/**
 * ORM Model for the gallery table.
 * 
 * Galleries belong to Users.
 * Galleries have many Pictures through GalleryPicture.
 * Galleries have manu GalleryFollowingUsers through GalleryUsers.
 * 
 * @property {number} id The private key of the gallery.
 * @property {number} userId The user foreign key that owns the gallery.
 * @property {number} galleryPictureId The id of the through table to pictures.
 * 
 * @property {string} name The display name of the gallery.
 * @property {string?} description The description of the gallery.
 * 
 * @property {Date} createdAt The date/time that the gallery was created at.
 * @property {Date} updatedAt The date/time that the gallery was last updated at.
 */
class Gallery extends Model { }

Gallery.init({
	name: {
		type: DataTypes.STRING,
		allowNull: false,
		validate: {
			notEmpty: true,
		},
	},
	description: {
		type: DataTypes.TEXT,
		allowNull: true,
		validate: {
			
		}
	}
}, {
	sequelize: sequelize,
	freezeTableName: true,
	underscored: true,
	modelName: "gallery",
});

module.exports = Gallery;
