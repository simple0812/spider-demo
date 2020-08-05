var db = require("./db");
var Sequelize = require("sequelize");

class MenuTree extends Sequelize.Model {}
 // {"dbcode":"hgyd","id":"A01","isParent":true,"name":"价格指数","pid":"","wdcode":"zb"}
MenuTree.init(
  {
    id: {
      type: Sequelize.STRING(20),
    //   autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    dbcode: {
      type: Sequelize.STRING(20),
    },
    isParent: {
      type: Sequelize.BOOLEAN,
    },
    name: {
      type: Sequelize.STRING(200),
    },
    pid: {
      type: Sequelize.STRING(20),
    },
    wdcode: {
      type: Sequelize.STRING(20),
    },
    createdAt: {
      type: Sequelize.BIGINT(13),
      allowNull: false,
      defaultValue: () => {
        return Date.now()
      }
    },
    updateAt: {
      type: Sequelize.BIGINT(13),
      allowNull: false,
      defaultValue: () => {
        return Date.now()
      }
    },
    
  },
  {
    sequelize:db,
    timestamps: false,
    freezeTableName: true,
    underscored: false,
    tableName: "menu_tree",
  }
);

module.exports = MenuTree;
