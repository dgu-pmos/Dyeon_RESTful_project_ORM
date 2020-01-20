module.exports = (sequelize, DataTypes) => {
    // 스키마 정의
    const Comment = sequelize.define(
        // 테이블 이름
        "Comment", {
            // 속성명
            // 댓글 idx
            commentIdx: {
                // 데이터 타입 설정
                type: DataTypes.INTEGER(11),
                // null 허용 안함
                allowNull: false,
                // 기본키
                primaryKey: true,
                // 자동 증가
                autoIncrement: true
            },          
            name: {
                type: DataTypes.STRING(45),
                allowNull: false
            },
            // 댓글 내용
            content: {
                type: DataTypes.STRING(1000),
                allowNull: false
            },
            // 부모 댓글 idx
            ref_comment: {
                type: DataTypes.INTEGER(11),
                allowNull: true
            }
        }, {}
    );

    Comment.associate = function (models) {
        // Users 테이블의 idx를 외래키로 갖는다(1:N 관계)
        Comment.belongsTo(models.User, {
            foreignKey: "userIdx",
            targetKey: "userIdx",
            onDelete: 'cascade',
            onUpdate: 'cascade'
        });
        // Boards 테이블의 idx를 외래키로 갖는다(1:N 관계)
        Comment.belongsTo(models.Board, {
            foreignKey: "boardIdx",
            targetKey: "boardIdx",
            onDelete: 'cascade',
            onUpdate: 'cascade'
        });
    };

    return Comment;
};