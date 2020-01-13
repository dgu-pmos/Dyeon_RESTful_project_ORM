const pool = require('../module/db/pool');

module.exports = {
    // 게시글을 생성하는 함수이다.
    create : async (json) => {
        // 생성할 필드를 정의한다.
        const fields = 'userIdx, title, content, active';
        // 삽입할 값들을 정의한다.
        const questions = `"${json.userIdx}", "${json.title}", "${json.content}", "${json.active}"`;
        // 실제 동작할 쿼리
        const result = await pool.queryParam_None(`INSERT INTO Board(${fields}) VALUES(${questions})`);
        return result;
    },

    maxPage : async (page) => {
        const result = await pool.queryParam_None(`
        SELECT COUNT(*) AS cnt FROM Board
        WHERE active = 1
        `)
        return result;
    },

    // 게시글 전체 조회 함수
    readAll : async (page) => {
        //const result = await pool.queryParam_None(`SELECT * FROM Board WHERE active = 1`);
        const offset_num = (3 * page) - 3;
        let result = await pool.queryParam_None(`
        SELECT * FROM Board JOIN User ON Board.userIdx = User.userIdx 
        WHERE active = 1
        LIMIT ${offset_num}, 3
        `)
        return result;
    },

    // 상세 게시글 조회 함수
    read : async (boardIdx) => {
        const result = await pool.queryParam_None(`SELECT * FROM Board WHERE boardIdx = ${boardIdx}`);
        return result;
    },

    update : async (json) => {
        const conditions = [];

        // 만약에 수정 사항이 존재한다면, condition 배열에 push 한다.
        if (json.title) conditions.push(`title = '${json.title}'`);
        if (json.content) conditions.push(`content = '${json.content}'`);
        if (json.active) conditions.push(`active = '${json.active}'`);

        // 만약 수정 사항이 존재한다면, SET 문을 추가한다.
        const setStr = conditions.length > 0 ? `SET ${conditions.join(',')}` : '';
        const result = await pool.queryParam_None(`UPDATE Board ${setStr} WHERE userIdx = ${json.userIdx} AND boardIdx = ${json.boardIdx}`);
        return result;
    },

    // 게시글을 제거하는 함수
    remove : async (json) => {
        const result = await pool.queryParam_None(`DELETE FROM Board WHERE userIdx = '${json.userIdx}' and boardIdx = '${json.boardIdx}'`)
        return result;
    }
}
