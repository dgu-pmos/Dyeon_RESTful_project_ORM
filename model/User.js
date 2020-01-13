const pool = require('../module/db/pool');
const table = 'User';

const user = {
    // 회원가입 함수
    signup : async (json) => {
        const fields = 'email, name, password';
        const questions = `"${json.email}","${json.name}","${json.password}"`;        
        const result = await pool.queryParam_None(`INSERT INTO ${table}(${fields})VALUES(${questions})`)
        return result;
    },
    // 존재하는 사용자인지 검사하는 함수
    checkUser : async (email) => {   
        const result = await pool.queryParam_None(`SELECT * FROM ${table} WHERE email = "${email}"`)
        return result;     
    }, 
    // 패스워드가 일치하는지 검사하는 함수
    checkPassword : async (email, password) => {
        const result = await pool.queryParam_None(`SELECT * FROM ${table} WHERE email = "${email}" AND password = "${password}"`)
        return result;
    } 
}

module.exports = user;