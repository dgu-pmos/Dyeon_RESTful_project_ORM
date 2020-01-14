module.exports = (sequelize, DataTypes) => {
    const Like = sequelize.define(
        "Like",
        {
            // 좋아요 idx
            likeIdx: {
                // 데이터 타입 설정
                type: DataTypes.INTEGER(11), 
                // null 허용 안함
                allowNull: false, 
                // 기본키
                primaryKey: true, 
                // 자동 증가
                autoIncrement: true 
            },
            // 사용자 idx
            userIdx: {
                type: DataTypes.INTEGER(11),
                allowNull: false
            },
            // 게시글 idx
            boardIdx: {
                type: DataTypes.INTEGER(11),
                allowNull: false
            }
        }, {}
    );

    Like.associate = function (models) {
        Like.belongsTo(models.User, {
            foreignKey: "userIdx",
            onDelete: 'cascade', 
            onUpdate: 'cascade'
        });
        Like.belongsTo(models.Board, {
            foreignKey: "boardIdx",
            onDelete: 'cascade', 
            onUpdate: 'cascade'
        });
    };

    return Like;
};