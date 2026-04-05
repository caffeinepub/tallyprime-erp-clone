require('dotenv').config({path:require('path').join(__dirname,'../.env')});
const {initRabbitMQ,consumeQueue,QUEUES}=require('../database/rabbitmq');
const {initRedis}=require('../database/redis');
const {initMySQL}=require('../database/mysql');
const {initSQLite}=require('../database/sqlite');
const {query}=require('../database/db');

async function startWorkers(){
  await initMySQL().catch(()=>console.warn('MySQL offline'));
  initSQLite();
  await initRedis().catch(()=>console.warn('Redis offline'));
  await initRabbitMQ();
  await consumeQueue(QUEUES.WHATSAPP,async(msg)=>{
    console.log(`[WA] Sending to ${msg.phone}`);
    await query('UPDATE whatsapp_queue SET status="sent",sent_at=NOW() WHERE id=?',[msg.id]).catch(()=>{});
  });
  await consumeQueue(QUEUES.REPORTS,async(msg)=>{console.log(`[Reports] ${msg.type}`);});
  await consumeQueue(QUEUES.SYNC,async(msg)=>{console.log(`[Sync] ${msg.type}`);});
  console.log('\n\u2705 Workers: WHATSAPP | REPORTS | SYNC\n');
}
startWorkers().catch(console.error);
