module.exports = (sequelize, DataTypes) => {
    // 스키마 정의
    const Board = sequelize.define(
        // 테이블 이름
        "Board", 
        {
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
            // 사용자 idx
            userIdx: {
                type: DataTypes.INTEGER(11),
                allowNull: false
            },
            // 글 제목
            title: {
                type: DataTypes.STRING(100),
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
        // Board.hasMany(models.Comment, {onDelete: 'cascade', onUpdate: 'cascade'});
        // Board.hasMany(models.Likes, {onDelete: 'cascade', onUpdate: 'cascade'});

        // Users 테이블의 idx를 외래키로 갖는다(1:N 관계)
        Board.belongsTo(models.User, {
            foreignKey: "userIdx",
            // 삭제 시 cascade
            onDelete: 'cascade', 
            // 수정 시 cascade
            onUpdate: 'cascade'
        })
    };

    return Board;
};