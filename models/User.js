module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define(
        "User", // 테이블 이름
        {
            // 스키마 정의
            userIdx: {
                // column 이름
                type: DataTypes.INTEGER(11), // 데이터 타입 설정
                allowNull: false, // null 허용 안함
                primaryKey: true, // 기본키
                autoIncrement: true // 자동 증가
            },
            email: {
                type: DataTypes.STRING(45),
                allowNull: false
            },
            name: {
                type: DataTypes.STRING(45),
                allowNull: false
            },
            password: {
                type: DataTypes.STRING(45),
                allowNull: false
            }
        }, {}
    );
/*
    User.associate = function (models) {
        User.hasMany(models.Board, {onDelete: 'cascade', onUpdate: 'cascade'});
        User.hasMany(models.Comment, {onDelete: 'cascade', onUpdate: 'cascade'});
        User.hasMany(models.Likes, {onDelete: 'cascade', onUpdate: 'cascade'});
    };
    */

    return User;
};