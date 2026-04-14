import Redis from 'ioredis';

const redis = new Redis();
const publisher=new Redis();
const subscriber= new Redis();

redis.on('connect', ()=>{
    console.log("Connected to redis successfully");
})


export default redis;
export {publisher, subscriber};


