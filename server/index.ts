import fetch from 'node-fetch';
const cheerio = require('cheerio');

type Time = {
    Time: Date,
    Limitation?: string,
};

interface Station {
    [index: int]: Time,
    Japanese: string,
    English: string,
};
interface ITimetable {
    [index: string]: Station
}
const timetables: Timetable = {};
const meta: Object = {};
const lines: Array<string> = [];
const TimeSortingFunc = (a: string, b: string)=>{
    const aSplit = a.split(":");
    const aHour = Number(aSplit[0])
    const aMinute = Number(aSplit[1])
    const bSplit = b.split(":");
    const bHour = Number(bSplit[0])
    const bMinute = Number(bSplit[1])
    if(aHour < bHour){
        return -1;
    } else if(aHour > bHour){
        return 1
    }
    if(aMinute < bMinute){
        return -1;
    } else if(aMinute > bMinute){
        return 1
    } 
}
const Parse = (type: string, stationPrefix: string) => (body: any) => {
    const html = cheerio.load(body);
    const scheduledata = html('body > center > center > table > tbody > tr > td > table > tbody > tr > td > table > tbody > tr:nth-child(4) > td > table > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(n):nth-child(-n+2)').children();
    const linedata = html('body > center > center > table > tbody > tr > td > table > tbody > tr > td > table > tbody > tr:nth-child(4) > td > table > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(3)').text();
    const data = html('body > center > center > table > tbody > tr > td > table > tbody > tr > td > table > tbody > tr:nth-child(4) > td > table > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(n+4)').text();
    const rows = data.split("\n").map((row)=>row.trim());
    const metarows = scheduledata.map((_, m)=> {
        const t = html(m).text().trim();
        if (t != ""){
            const [Japanese, English] = t.split("\n").map((line)=>line.trim());
            const bgcolor = html(m).attr('bgcolor');
            const color = html(m).children().first().attr('color');
            return {Japanese, English, Diffrentiators: {bgcolor, color}};
        }
    })
    console.log(metarows.toArray())
    
    lines = linedata.split("\n").filter((row)=> row.trim() != "").map((row)=>row.trim());
    let pastMeta: boolean = false;
    let currentStation: string;
    

    for(let i = 0; i < rows.length; i++){
        const currentRow = rows[i];
        if(currentRow.indexOf(":") !== -1){
            timetables[currentStation][type].push(currentRow);
        } else {
            if(currentRow.indexOf(stationPrefix) === 0 && currentRow.length <= 3){
                currentStation = rows[i+1].replace(/\s+/g, "");
                timetables[currentStation] = !!timetables[currentStation] ? timetables[currentStation] : {};
                timetables[currentStation][type] = !!timetables[currentStation][type] ? timetables[currentStation][type] : [];
                timetables[currentStation].Abbrevation = rows[i];
                timetables[currentStation].English = rows[i+2];
                i+=2;
            }
        }
    }
    const keys = Object.keys(timetables);

    for(let key of keys) {
        if (timetables[key][type] !== undefined){
            timetables[key][type].sort(TimeSortingFunc)
        }        
    }
};
fetch("http://www.kotoden.co.jp/publichtm/kotoden/time/jikoku_new/01k_down.htm")
    .then((res: any) => {
        return res.text();
    })
    .then(Parse("Outgoing","K"))
    // .then(()=>{
    //     return fetch("http://www.kotoden.co.jp/publichtm/kotoden/time/jikoku_new/02n_down.htm")

    // })
    // .then((res: any) => {
    //     return res.text();
    // })
    // .then(Parse("Incoming","N"))
    // .then(()=>{
    // })

