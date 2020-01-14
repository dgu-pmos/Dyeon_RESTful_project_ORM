module.exports = (sequelize, DataTypes) => {
    const Board = sequelize.define(
        "Board", // 테이블 이름
        {
            // 스키마 정의
            boardIdx: {
                // column 이름
                type: DataTypes.INTEGER(11), // 데이터 타입 설정
                allowNull: false, // null 허용 안함
                primaryKey: true, // 기본키
                autoIncrement: true // 자동 증가
            },
            userIdx: {
                type: DataTypes.INTEGER(11),
                allowNull: false
            },
            title: {
                type: DataTypes.STRING(100),
                allowNull: false
            },
            content: {
                type: DataTypes.STRING(1000),
                allowNull: false
            },
            active: {
                type: DataTypes.INTEGER(11),
                allowNull: false
            }
        }, {}
    );

    Board.associate = function (models) {
        // Board.hasMany(models.Comment, {onDelete: 'cascade', onUpdate: 'cascade'});
        // Board.hasMany(models.Likes, {onDelete: 'cascade', onUpdate: 'cascade'});
        Board.belongsTo(models.User, {
            foreignKey: "userIdx",
            onDelete: 'cascade', 
            onUpdate: 'cascade'
        })
    };

    return Board;
};