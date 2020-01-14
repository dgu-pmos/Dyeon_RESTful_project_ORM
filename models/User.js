module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define(
        "User",
        {
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
                type: DataTypes.STRING(45),
                allowNull: false
            },
            // 이름
            name: {
                type: DataTypes.STRING(45),
                allowNull: false
            },
            // 비밀번호(미사용)
            password: {
                type: DataTypes.STRING(45),
                allowNull: false
            },
            // 카톡 내 id
            snsId: {
                type: DataTypes.STRING(100),
                allowNull: true
            },
            // 제공사
            provider: {
                type: DataTypes.STRING(45),
                allowNull: true
            },
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