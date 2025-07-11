const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Problem', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(1024),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    inputFormat: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: ''
    },
    outputFormat: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: ''
    },
    sampleTestcases: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    hint: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: ''
    },
    testcaseInfo: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    providerId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'problems',
    timestamps: false
  });
}; 