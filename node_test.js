
'use strict';

const sql = require('mssql');
let allergen_dict={};
 
async function query(){
    try {
        const pool = await sql.connect({user: "estephenson", password: "3d4vLDBoYNtq", server:"cbord3.smith.edu", database: "cbord"});
        console.log("connected");
        const meals = await sql.query`SELECT * FROM av_srv_menu_detail WHERE eventdate >= Convert(Date, GetDate(), 101) AND eventdate <= Convert(Date, GetDate()+1, 101) ORDER BY eventdate, service_unit, meal`;
        const allergens = await sql.query`SELECT * FROM av_item_traits WHERE trait_category IN ('Dietary', 'Allergen', 'General')`;
    	pool.close();
    } catch (err) {
        console.log(err);
    }
}

query();