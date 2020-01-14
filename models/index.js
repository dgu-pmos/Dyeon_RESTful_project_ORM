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
    dialect: "mysql", // Sequelize is independent from specific dialects. This means that you'll have to install the respective connector library to your project yourself.
    operatorsAliases: false // Sequelize는 연산자에 대하여 별칭을 부여할 수 있게 해줍니다.
};
const db = {};

let sequelize;
/*
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}
*/
sequelize = new Sequelize(config.database, config.username, config.password, config);

fs
  .readdirSync(__dirname) // 디렉토리 소속의 파일 정보를 읽는 동기적인 메소드
  // basename(index.js)가 아니면서 js 파일인 경우만 필터링
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  }) 
  // 필터링된 각각의 파일들을 sequlize를 이용해 import하고 db 배열에 넣는다.
  .forEach(file => {
    const model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

// 각각의 모델들의 외래키 참조를 수행??
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
