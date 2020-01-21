'use strict';
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const config = {
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  dialect: "mysql", // Sequelize는 문법에 독립적이다. dialect(방언)에서 설정만 해주면 다양한 SQL 문법을 자유롭게 변역할 수 있다.
  operatorsAliases: false, // Sequelize는 연산자에 대하여 별칭을 부여할 수 있게 해줍니다.
  timezone: '+09:00',
  define: {
    timestamps: false
  }
};
const db = {};
const sequelize = new Sequelize(config.database, config.username, config.password, config);

fs
  // 디렉토리 소속의 파일 정보를 읽는 동기적인 메소드
  .readdirSync(__dirname)
  // basename(index.js)가 아니면서 js 파일인 경우만 필터링
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  // 필터링된 각각의 파일들을 Sequelize를 이용해 import하고 db 배열에 넣는다.
  .forEach(file => {
    const model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
