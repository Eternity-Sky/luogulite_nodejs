const { DataTypes } = require('sequelize');
module.exports = (sequelize) => sequelize.define('Solution', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  problemId: { type: DataTypes.INTEGER, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  likeCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, {
  tableName: 'Solutions',
  timestamps: true
}); 