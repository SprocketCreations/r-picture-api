const Comment = require("./Comment.js");
const Gallery = require("./Gallery.js");
const GalleryPicture = require("./GalleryPicture.js");
const GalleryUser = require("./GalleryUser.js");
const Like = require("./Like.js");
const Picture = require("./Picture.js");
const PictureTag = require("./PictureTag.js");
const Tag = require("./Tag.js");
const User = require("./User.js");
const UserUser = require("./UserUser.js");

User.hasMany(Picture);
Picture.belongsTo(User);

User.hasMany(Gallery);
Gallery.belongsTo(User);

User.hasMany(GalleryPicture);
GalleryPicture.belongsTo(User);

User.hasMany(Comment);
Comment.belongsTo(User);

User.hasMany(Like);
Like.belongsTo(User);

Picture.belongsToMany(Tag, { through: PictureTag });
Tag.belongsToMany(Picture, { through: PictureTag });

Picture.hasMany(Comment);
Comment.belongsTo(Picture);

Picture.hasMany(Like);
Like.belongsTo(Picture);

Picture.belongsToMany(Gallery, { through: GalleryPicture });
Gallery.belongsToMany(Picture, { through: GalleryPicture });

User.belongsToMany(Gallery, { through: GalleryUser, as: { singular: "galleryFollowingUser", plural: "galleryFollowingUser" }, foreignKey: "followerUserId" });
Gallery.belongsToMany(User, { through: GalleryUser, as: { singular: "followedGallery", plural: "followedGallery" }, foreignKey: "followedGalleryId" });

GalleryUser.belongsTo(Gallery, { as: "followedGallery" });

User.belongsToMany(User, { through: UserUser, as: { singular: "userFollowingUser", plural: "userFollowingUser" }, foreignKey: "followerUserId" });
User.belongsToMany(User, { through: UserUser, as: { singular: "followedUser", plural: "followedUser" }, foreignKey: "followedUserId" });

UserUser.belongsTo(User, { as: "followedUser" });
UserUser.belongsTo(User, { as: "userFollowingUser" });


module.exports = {
	Comment,
	Gallery,
	GalleryPicture,
	GalleryUser,
	Like,
	Picture,
	PictureTag,
	Tag,
	User,
	UserUser,
};