var db = require("./db");
var Sequelize = require("sequelize");

class MonthData extends Sequelize.Model {}
/**
  * data: 0
dotcount: 1
hasdata: false
strdata: ""
  */
MonthData.init(
  {
    id: {
      type: Sequelize.STRING(20),
      //   autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    data: {
      type: Sequelize.FLOAT,
    },
    dotcount: {
      type: Sequelize.INTEGER,
    },
    hasdata: {
      type: Sequelize.BOOLEAN,
    },
    strdata: {
      type: Sequelize.STRING(200),
    },

    time: {
      type: Sequelize.DATE,
    },

    // 外键
    dataIndexId: {
      type: Sequelize.INTEGER,
    },

    status: {
      type: Sequelize.INTEGER,
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
  },
  {
    sequelize: db,
    timestamps: false,
    freezeTableName: true,
    underscored: false,
    tableName: "month_data",
    indexes: [
      {
        name: "month_data_time",
        fields: ["time"],
      },
    ],
  }
);

module.exports = MonthData;
