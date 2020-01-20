module.exports = (sequelize, DataTypes) => {
    // 스키마 정의
    const Board = sequelize.define(
        // 테이블 이름
        "Board", {
            // 속성명
            // 게시글 idx
            boardIdx: {
                // 데이터 타입 설정
                type: DataTypes.INTEGER(11),
                // null 허용 안함
                allowNull: false,
                // 기본키
                primaryKey: true,
                // 자동 증가
                autoIncrement: true
            },
            // 작성자 이름
            name: {
                type: DataTypes.STRING(45),
                allowNull: false
            },
            // 글 제목
            title: {
                type: DataTypes.STRING(1000),
                allowNull: false
            },
            // 글 내용
            content: {
                type: DataTypes.STRING(1000),
                allowNull: false
            },
            // 글 공개, 비공개 flag
            active: {
                type: DataTypes.INTEGER(11),
                allowNull: false
            }
        }, {}
    );

    Board.associate = function (models) {
        // Users 테이블의 idx를 외래키로 갖는다(1:N 관계)
        Board.belongsTo(models.User, {
            // 외래키명은 userIdx
            foreignKey: "userIdx",
            // User 테이블의 userIdx가 타겟이다.
            targetKey: "userIdx",
            // 삭제 시 cascade
            onDelete: 'cascade',
            // 수정 시 cascade
            onUpdate: 'cascade'
        });
        // Board는 여러 개의 Comment를 가질 수 있다.
        Board.hasMany(models.Comment, {
            foreignKey: "boardIdx",
            sourceKey: "boardIdx"
        });
        // Board는 여러 개의 Like를 가질 수 있다.
        Board.hasMany(models.Like, {
            foreignKey: "boardIdx",
            targetKey: "boardIdx"
        });
    };

    return Board;
};