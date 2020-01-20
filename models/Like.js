module.exports = (sequelize, DataTypes) => {
    const Like = sequelize.define(
        "Like", {
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
            }
        }, {}
    );

    Like.associate = function (models) {
        // Users 테이블의 idx를 외래키로 갖는다(1:N 관계)
        Like.belongsTo(models.User, {
            foreignKey: "userIdx",
            targetKey: "userIdx",
            onDelete: 'cascade',
            onUpdate: 'cascade'
        });
        // Boards 테이블의 idx를 외래키로 갖는다(1:N 관계)
        Like.belongsTo(models.Board, {
            foreignKey: "boardIdx",
            targetKey: "boardIdx",
            onDelete: 'cascade',
            onUpdate: 'cascade'
        });
    };

    return Like;
};