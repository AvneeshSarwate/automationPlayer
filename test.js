
// let rampValues = [{time: 0.5, val: 0.8}, {time: 1.2, val: 0}, {time: 2.8, val: 0.9}, {time: 3.2, val: 0.3}];

// let beats2secs = (beats, bpm) => beats * (60/bpm);

// function formatRampVals(rampVals) {
//     let formattedVals = rampVals.map((v, ind, rampArray) => {
//         let pointInfo = { 
//             val: v.val
//             ind,
//             rampArray
//         };
//         return [beats2secs(v.time, Tone.Transport.bpm.value), pointInfo];
//     }):
//     return formattedVals;
// }


// function createPartFromRamp(rampVals) {
//     let formattedVals = formatRampVals(rampVals);
//     let part = new Tone.Part((time, hitInfo) => {

//     }, formattedVals);
//     part.loop = true;
//     return part;
// }



/*
transport.clear(eventId)
*/

// From: https://stackoverflow.com/questions/5467129/sort-javascript-object-by-key
function sortObjectKeys(obj){
    if(obj == null || obj == undefined){
        return obj;
    }
    if(typeof obj != 'object'){ // it is a primitive: number/string (in an array)
        return obj;
    }
    return Object.keys(obj).sort().reduce((acc,key)=>{
        if (Array.isArray(obj[key])){
            acc[key]=obj[key].map(sortObjectKeys);
        }
        else if (typeof obj[key] === 'object'){
            acc[key]=sortObjectKeys(obj[key]);
        }
        else{
            acc[key]=obj[key];
        }
        return acc;
    },{});
}

//creates a "hash" of the value of a simple javascript object
function hashObj(obj){
    return JSON.stringify(sortObjectKeys(obj));
}

let beats2secs = (beats, bpm) => beats * (60/bpm);

//converts float of "beats" to Tone.js measures:quarter:sixteenth notation and assumes 4/4 time signaure
function f2mbs(floatBeats){
    let measures = Math.floor(floatBeats/4);
    let quarters = Math.floor(floatBeats) % 4;
    let sixteenths = (floatBeats%1) / 0.25;
    return measures + ':' + quarters + ':' + sixteenths;
}

let mbs2f = mbs => {
    let measure = parseFloat(mbs.split(':')[0]) * 4
    let quarter = parseFloat(mbs.split(':')[1]);
    let sixteenth = parseFloat(mbs.split(':')[2]) / 4;
    return measure + quarter + sixteenth;
}

function m2f (m) {
    return m === 0 || (m > 0 && m < 128) ? Math.pow(2, (m - 69) / 12) * 440 : null
}

let rampValues = [
    {time: 0.5, val: m2f(50)}, 
    {time: 1.5, val: m2f(72)}, 
    {time: 2.5, val: m2f(60)}, 
    {time: 3.5, val: m2f(65)}];

rampValues = [
    {time: 0.5, val: m2f(50)}, 
    {time: 1, val: m2f(50)},
    {time: 1.5, val: m2f(72)},
    {time: 2, val: m2f(72)}, 
    {time: 2.5, val: m2f(60)}, 
    {time: 3, val: m2f(60)},
    {time: 3.5, val: m2f(65)},
    {time: 4, val: m2f(65)}
];


let transport = Tone.Transport;
let loopLengthInBeats = 4;
transport.loop = true;

transport.loopStart = "0:0:0";

//the getter on loop-end returns a float, this makes the index math cleaner, and
//allows us to do things like 0:19:0 for weird loop lenghts 
let loopEnd = "0:6:0";
transport.loopEnd = loopEnd;

let sin = new Tone.Oscillator();
sin.toMaster().start();
let start = () => Tone.Transport.start();
let stop = () => Tone.Transport.stop();
sin.volume.value = 0.5;
let param = sin.frequency;

let timeline = new Tone.Timeline();
//schedule the events using transport time, but keep a "beats" float propert for easy math
let formatPoint = v => ({time: f2mbs(v.time, transport.bpm.value), beats: v.time, val: v.val});
let formattedVals = rampValues.map(formatPoint);
formattedVals.forEach(v => timeline.add(v));

let eventIdList = formattedVals.map((v, i) => transport.schedule(time => {
        let firstEvent = timeline.get(0) || timeline.getAfter(0);
        let nextEvent = timeline.getAfter(v.time) || firstEvent;

        let edgeTimes = firstEvent.beats + mbs2f(loopEnd)-v.beats;
        let segmentDuration = v.beats < nextEvent.beats ? nextEvent.beats-v.beats : edgeTimes;
        console.log("rampTo", nextEvent.val, segmentDuration.toFixed(1), i);
        param.rampTo(nextEvent.val, f2mbs(segmentDuration)) //todo - why does putting time here fail?
    }, v.time));

let eventIdToPoint = {};
let pointToEventId = {};
eventIdList.forEach((id, ind) => {
    eventIdToPoint[id] = formattedVals[ind];
    pointToEventId[hashObj(formattedVals[ind])] = id;
});

function addBreakpoint(point){
    let loopTime = transport.loopStart + transport.progress * (transport.loopEnd-transport.loopStart);

    let nextActivePoint = timeline.getAfter(loopTime) || firstEvent;
    let eventAfterNewPoint = timeline.getAfter(point.time) || firstEvent;
    if(hashObj(nextActivePoint) == hashObj(eventAfterNewPoint)){
        let loopTimeBeats = mbs2f(new Tone.TransportTime(loopTime).toBarsBeatsSixteenths());
        let nextPointTime = nextActivePoint.beats;
        //to 2 part ramp - ramp from current value to NEW (now+delta value)
        // then ramp from NEW now+delta value to NEXT value
    }
    //add event to timeline
}

function removeBreakpont(point){
    let loopTime = transport.loopStart + transport.progress * (transport.loopEnd-transport.loopStart);
    //remove the event from the timeline
    /* calculate the new "current" value based on the 
       event before the deleted one, the one after the
       deleted one, and the current loopTime
    */
    let startTime = timeline.get(loopTime) || timeline.get(transport.loopEnd) - transport.loopEnd;
    let endTime = timeline.getAfter(loopTime) || transport.loopEnd + timeline.getAfter(0)

    if(startTime < loopTime && loopTime < endTime){
        
    }
}


let envelope = new Nexus.Envelope('#envelope',{
    'size': [300,150]
});

envelope.on('change',function(v) {
    console.log(v);
});