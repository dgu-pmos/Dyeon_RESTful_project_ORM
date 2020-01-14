module.exports = (sequelize, DataTypes) => {
    const Comment = sequelize.define(
        "Comment", // 테이블 이름
        {
            // 스키마 정의
            commentIdx: {
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
            boardIdx: {
                type: DataTypes.INTEGER(11),
                allowNull: false
            },
            content: {
                type: DataTypes.STRING(100),
                allowNull: false
            },
            ref_comment: {
                type: DataTypes.INTEGER(11),
                allowNull: true
            }
        }, {}
    );

    Comment.associate = function (models) {
        Comment.belongsTo(models.User, {
            foreignKey: "userIdx",
            onDelete: 'cascade', 
            onUpdate: 'cascade'
        });
        Comment.belongsTo(models.Board, {
            foreignKey: "boardIdx",
            onDelete: 'cascade', 
            onUpdate: 'cascade'
        });
    };

    return Comment;
};