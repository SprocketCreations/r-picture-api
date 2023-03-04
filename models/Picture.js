const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection.js");

/**
 * ORM Model for the picture table.
 * 
 * 
 * @property {number} id The private key of the picture.
 * @property {number} userId The user foreign key that owns the picture.
 * 
 * @property {string} name The display name of the picture.
 * @property {string} description The description of the picture.
 * @property {string} S3URL The url of the picture hosted on AWS S3.
 */
class Picture extends Model { }

Picture.init({
	name: {
		type: DataTypes.STRING,
		allowNull: false,
		validate: {
			notEmpty: true,
		}
	},
	description: {
		type: DataTypes.TEXT,
		validate: {
			notEmpty: true,
		}
	},
	S3URL: {
		type: DataTypes.STRING,
		allowNull: false,
		validate: {
			isUrl: true,
		}
	}
}, {
	sequelize: sequelize,
	freezeTableName: true,
	underscored: true,
	modelName: "picture",
});

module.exports = Picture;
