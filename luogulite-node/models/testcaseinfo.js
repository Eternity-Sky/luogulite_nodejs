const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('TestcaseInfo', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    timeLimit: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    memoryLimit: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'testcaseinfos',
    timestamps: false
  });
}; 