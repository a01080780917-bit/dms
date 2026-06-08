
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
const firebaseConfig={
apiKey:'AIzaSyASV-JqE8ou5_r51Bfc_BwFek623_M55tg',
authDomain:'wonderful-7a953.firebaseapp.com',
projectId:'wonderful-7a953',
storageBucket:'wonderful-7a953.firebasestorage.app',
messagingSenderId:'241356881290',
appId:'1:241356881290:web:0d4af1e3c38902da235c73'
};

const app=initializeApp(firebaseConfig);
const db=getFirestore(app);

let lat=36.35,lng=127.38;
const map=L.map('map').setView([36.35,127.38],12);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

window.getLocation=()=>{
navigator.geolocation.getCurrentPosition(p=>{
lat=p.coords.latitude;lng=p.coords.longitude;
map.setView([lat,lng],14);
});
}

window.savePost=()=>{
const file=image.files[0];
const reader=new FileReader();
reader.onload=async()=>{
await addDoc(collection(db,'posts'),{
title:title.value,
category:category.value,
region:region.value,
description:description.value,
imageBase64:reader.result,
latitude:lat,
longitude:lng,
status:'미회수'
});
loadPosts();
};
reader.readAsDataURL(file);
};

window.removePost=async(id)=>{
await deleteDoc(doc(db,'posts',id));
loadPosts();
}

window.recoverPost=async(id)=>{
await updateDoc(doc(db,'posts',id),{status:'회수완료'});
loadPosts();
}

window.editPost=async(id)=>{
const newTitle=prompt('새 제목');
if(!newTitle)return;
await updateDoc(doc(db,'posts',id),{title:newTitle});
loadPosts();
}

async function loadPosts(){
posts.innerHTML='';
const snap=await getDocs(collection(db,'posts'));
snap.forEach(d=>{
const p=d.data();
const filter=regionFilter.value;
if(filter && p.region!==filter)return;

L.marker([p.latitude,p.longitude]).addTo(map)
.bindPopup(`<b>${p.title}</b><br>${p.region}`);

posts.innerHTML+=`
<div class="card">
<img src="${p.imageBase64}">
<h3>${p.title}</h3>
<p>${p.description}</p>
<p>${p.category} | ${p.region}</p>
<span class="badge">${p.status||'미회수'}</span>
<br><br>
<button onclick="recoverPost('${d.id}')">회수완료</button>
<button onclick="editPost('${d.id}')">수정</button>
<button onclick="removePost('${d.id}')">삭제</button>
<button onclick="openChat('${d.id}')">채팅</button>
</div>`;
});
}

regionFilter.onchange=loadPosts;
loadPosts();
let currentRoom = null;

window.openChat = (postId) => {

    currentRoom = postId;

    document.getElementById('chatModal').style.display = 'block';

    const messagesRef = query(
        collection(db, 'chats', postId, 'messages'),
        orderBy('timestamp')
    );

    onSnapshot(messagesRef, (snapshot) => {

        const box = document.getElementById('chatMessages');

        box.innerHTML = '';

        snapshot.forEach(doc => {

            const msg = doc.data();

            box.innerHTML += `
                <div>
                    <b>${msg.sender}</b> :
                    ${msg.text}
                </div>
            `;
        });

        box.scrollTop = box.scrollHeight;
    });
};

window.closeChat = () => {
    document.getElementById('chatModal').style.display = 'none';
};

window.sendMessage = async () => {

    const input = document.getElementById('chatInput');

    if (!input.value.trim()) return;

    await addDoc(
        collection(db, 'chats', currentRoom, 'messages'),
        {
            sender: '익명사용자',
            text: input.value,
            timestamp: serverTimestamp()
        }
    );

    input.value = '';
};
