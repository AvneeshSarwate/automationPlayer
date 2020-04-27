
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

let beats2secs = (beats, bpm) => beats * (60/bpm);

function m2f (m) {
    return m === 0 || (m > 0 && m < 128) ? Math.pow(2, (m - 69) / 12) * 440 : null
}

let rampValues = [{time: 0.5, val: m2f(50)}, {time: 1.2, val: m2f(72)}, {time: 2.8, val: m2f(60)}, {time: 3.2, val: m2f(65)}];


let transport = Tone.Transport;
let loopLengthInBeats = 4;
transport.loop = true;
transport.loopStart = 0;
transport.loopEnd = beats2secs(loopLengthInBeats, transport.bpm.value);

let sin = new Tone.Oscillator();
sin.toMaster().start();
let start = () => Tone.Transport.start();
let stop = () => Tone.Transport.stop();
sin.volume.value = 0.5;
let param = sin.frequency;

let timeline = new Tone.Timeline();
let formattedVals = rampValues.map(v => ({time: beats2secs(v.time, transport.bpm.value), val: v.val}));
formattedVals.forEach(v => timeline.add(v));

let eventIdList = formattedVals.map(v => transport.schedule(() => {
        let firstEvent = timeline.get(0) || timeline.getAfter(0);
        let nextEvent = timeline.getAfter(v.time) || firstEvent;

        let edgeTimes = firstEvent.time + transport.loopEnd-v.time;
        let segmentDuration = v.time < nextEvent.time ? nextEvent.time-v.time : edgeTimes;
        console.log("rampTo", nextEvent.val, segmentDuration);
        param.rampTo(nextEvent.val, segmentDuration)
    }, v.time));

let eventIdToPoint = {};
let pointToEventId = {};
eventIdList.forEach((id, ind) => {
    eventIdToPoint[id] = formattedVals[ind];
    pointToEventId[formattedVals[ind]] = id;
});

function addBreakpoint(point){
    let loopTime = transport.loopStart + transport.progress * (transport.loopEnd-transport.loopStart);
    /* if the time of your new event is in an "active" segment, 
       immediately set the param to the new val and trigger a 
       rampTo() for the remainder of the duration
    */
    let startTime = timeline.get(loopTime) || timeline.get(transport.loopEnd) - transport.loopEnd;
    let endTime = timeline.getAfter(loopTime) || transport.loopEnd + timeline.getAfter(0)
    if(startTime < loopTime && loopTime < endTime){

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