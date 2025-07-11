const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('JudgeRecord', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    problemId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('AC', 'UN_AC', 'CE'),
      allowNull: false
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'judgerecords',
    timestamps: false
  });
}; 