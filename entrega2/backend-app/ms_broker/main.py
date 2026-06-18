from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Any, Dict, List

app = FastAPI(title="Message Broker Mock (Event Bus)")

# In-memory storage
queues: Dict[str, List[Any]] = {}
topics: Dict[str, List[Any]] = {}
subscribers_offsets: Dict[str, Dict[str, int]] = {}  # topic -> {subscriber_id -> index}

class MessagePayload(BaseModel):
    payload: Any

@app.get("/")
def health_check():
    return {"status": "Broker is running"}

# ==========================================
# QUEUES (Pila FIFO - Procesamiento garantizado, 1 consumidor)
# ==========================================
@app.post("/queues/{queue_name}")
def publish_to_queue(queue_name: str, msg: MessagePayload):
    if queue_name not in queues:
        queues[queue_name] = []
    queues[queue_name].append(msg.payload)
    return {"status": "published", "queue": queue_name, "depth": len(queues[queue_name])}

@app.get("/queues/{queue_name}")
def consume_from_queue(queue_name: str):
    if queue_name not in queues or not queues[queue_name]:
        return {"message": None}
    # FIFO: pop the first item
    message = queues[queue_name].pop(0)
    return {"message": message}

# ==========================================
# TOPICS (Pub/Sub - Múltiples consumidores)
# ==========================================
@app.post("/topics/{topic_name}")
def publish_to_topic(topic_name: str, msg: MessagePayload):
    if topic_name not in topics:
        topics[topic_name] = []
    topics[topic_name].append(msg.payload)
    return {"status": "published", "topic": topic_name, "total_messages": len(topics[topic_name])}

@app.get("/topics/{topic_name}/{subscriber_id}")
def consume_from_topic(topic_name: str, subscriber_id: str):
    if topic_name not in topics:
        return {"messages": []}
    
    if topic_name not in subscribers_offsets:
        subscribers_offsets[topic_name] = {}
        
    current_offset = subscribers_offsets[topic_name].get(subscriber_id, 0)
    all_msgs = topics[topic_name]
    
    if current_offset < len(all_msgs):
        new_msgs = all_msgs[current_offset:]
        subscribers_offsets[topic_name][subscriber_id] = len(all_msgs)
        return {"messages": new_msgs}
    
    return {"messages": []}
