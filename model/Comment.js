const pool = require('../module/db/pool');

module.exports = {
    // 댓글 생성 함수
    create : async (json) => {
        let fields = 'boardIdx, userIdx, content';
        let questions = `"${json.boardIdx}", "${json.userIdx}", "${json.content}"`;
        // 만약 대댓글이라면 참조 댓글 idx를 추가한다.
        if(json.ref_comment){
            fields = fields + ', ref_comment';
            questions = questions + `, "${json.ref_comment}"`;
        }
        const result = await pool.queryParam_None(`INSERT INTO Comment(${fields}) VALUES(${questions})`);
        return result;
    },

    // 댓글 조회 함수
    read : async (boardIdx) => {
        const result = await pool.queryParam_None(`SELECT * FROM Comment WHERE boardIdx = ${boardIdx}`);
        return result;
    },

    // 댓글 수정 함수
    update : async (json) => {
        const result = await pool.queryParam_None(`UPDATE Comment SET content = '${json.content}' WHERE userIdx = ${json.userIdx} AND commentIdx = ${json.commentIdx}`);
        return result;
    },

    // 댓글 제거 함수
    remove : async (json) => {
        const result = await pool.queryParam_None(`DELETE FROM Comment WHERE userIdx = '${json.userIdx}' and commentIdx = '${json.commentIdx}'`)
        return result;
    }
}
