module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define(
        "User", {
            // 사용자 idx
            userIdx: {
                // 데이터 타입 설정
                type: DataTypes.INTEGER(11),
                // null 허용 안함
                allowNull: false,
                // 기본키
                primaryKey: true,
                // 자동 증가
                autoIncrement: true
            },
            // 이메일
            email: {
                type: DataTypes.STRING(100),
                allowNull: false
            },
            // 이름
            name: {
                type: DataTypes.STRING(45),
                allowNull: false
            },
            // 비밀번호(미사용)
            password: {
                type: DataTypes.STRING(1000),
                allowNull: false
            },
            // 카톡 내 id
            snsId: {
                type: DataTypes.STRING(1000),
                allowNull: true
            },
            // 제공사
            provider: {
                type: DataTypes.STRING(45),
                allowNull: false
            },
            createdAt: {
                type: DataTypes.DATE(),
                allowNull: false
            },
            updatedAt: {
                type: DataTypes.DATE(),
                allowNull: false
            }
        }, {}
    );

    User.associate = function (models) {
        // User는 여러 개의 Board를 가질 수 있다.
        User.hasMany(models.Board, {
            foreignKey: "userIdx",
            sourceKey: "userIdx"
        });
        // User는 여러 개의 Comment를 가질 수 있다.
        User.hasMany(models.Comment, {
            foreignKey: "userIdx",
            sourceKey: "userIdx"
        });
        // User는 여러 개의 Like를 가질 수 있다.
        User.hasMany(models.Like, {
            foreignKey: "userIdx",
            targetKey: "userIdx"
        });
    };

    return User;
};