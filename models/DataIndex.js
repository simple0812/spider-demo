var db = require("./db");
var Sequelize = require("sequelize");

class DataIndex extends Sequelize.Model {}
DataIndex.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    code: {
      type: Sequelize.STRING(20),
    },
    dotcount: {
      type: Sequelize.INTEGER,
    },
    exp: {
      type: Sequelize.TEXT,
    },
    ifshowcode: {
      type: Sequelize.BOOLEAN,
    },
    memo: {
      type: Sequelize.TEXT,
    },
    name: {
      type: Sequelize.STRING(200),
    },
    nodesort: {
      type: Sequelize.STRING(20),
    },
    sortcode: {
      type: Sequelize.INTEGER,
    },
    tag: {
      type: Sequelize.STRING(20),
    },
    unit: {
      type: Sequelize.STRING(20),
    },

    createdAt: {
      type: Sequelize.BIGINT(13),
      allowNull: false,
      defaultValue: () => {
        return Date.now();
      },
    },
    updateAt: {
      type: Sequelize.BIGINT(13),
      allowNull: false,
      defaultValue: () => {
        return Date.now();
      },
    },

    //外键
    menuTreeId: {
      type: Sequelize.STRING(20),
    },
  },
  {
    sequelize: db,
    timestamps: false,
    freezeTableName: true,
    underscored: false,
    tableName: "data_index",
    indexes: [
      {
        name: "data_index_menuTreeId",
        fields: ["menuTreeId"],
      }
    ],
  }
);

module.exports = DataIndex;
